#!/usr/bin/env bash
set -e

# ========================================================
# CareerMind -> Microsoft Azure One-Click Deployment Script
# ========================================================

RESOURCE_GROUP="${1:-rg-careermind-prod}"
LOCATION="${2:-eastus}"
PREFIX="${3:-careermind}"
ENVIRONMENT="${4:-prod}"
DB_PASSWORD="${5:-CareerMindSecure2026!#}"
JWT_SECRET="${6:-404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}"
IMAGE_TAG="${7:-latest}"

echo "=========================================================="
echo "  CareerMind -> Microsoft Azure Deployment Initiated"
echo "=========================================================="

# 1. Check Azure CLI
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI ('az') is not installed."
    exit 1
fi

# 2. Check Auth
echo "[1/6] Verifying Azure Authentication..."
az account show --output none || az login

# 3. Create Resource Group
echo "[2/6] Ensuring Resource Group '${RESOURCE_GROUP}' in '${LOCATION}'..."
az group create --name "${RESOURCE_GROUP}" --location "${LOCATION}" --output none

# 4. Generate ACR Name & Create ACR
echo "[3/6] Setting up Azure Container Registry..."
UNIQUE_HASH=$(echo -n "${RESOURCE_GROUP}" | md5sum | cut -c 1-6)
ACR_NAME="${PREFIX}acr${UNIQUE_HASH}"

if ! az acr show --name "${ACR_NAME}" --resource-group "${RESOURCE_GROUP}" --output none 2>/dev/null; then
    echo "Creating ACR '${ACR_NAME}'..."
    az acr create --resource-group "${RESOURCE_GROUP}" --name "${ACR_NAME}" --sku Basic --admin-enabled true --location "${LOCATION}" --output none
fi
ACR_SERVER=$(az acr show --name "${ACR_NAME}" --resource-group "${RESOURCE_GROUP}" --query "loginServer" -o tsv)
echo "ACR Login Server: ${ACR_SERVER}"

# 5. Build images in Azure Cloud
echo "[4/6] Building Docker Images in Azure Cloud (ACR Tasks)..."
az acr build --registry "${ACR_NAME}" --image "careermind-ml-service:${IMAGE_TAG}" ./ml-service
az acr build --registry "${ACR_NAME}" --image "careermind-backend:${IMAGE_TAG}" ./backend
az acr build --registry "${ACR_NAME}" --image "careermind-frontend:${IMAGE_TAG}" ./frontend

# 6. Deploy Infrastructure via Bicep
echo "[5/6] Deploying Azure Container Apps & Managed MySQL via Bicep..."
az deployment group create \
    --resource-group "${RESOURCE_GROUP}" \
    --template-file ./azure/bicep/main.bicep \
    --parameters location="${LOCATION}" \
                 prefix="${PREFIX}" \
                 environment="${ENVIRONMENT}" \
                 dbAdminPassword="${DB_PASSWORD}" \
                 jwtSecret="${JWT_SECRET}" \
                 imageTag="${IMAGE_TAG}" \
    --output json > deployment-result.json

# 7. Summary
echo "[6/6] Deployment Completed Successfully!"
echo "=========================================================="
FRONTEND_URL=$(az deployment group show --resource-group "${RESOURCE_GROUP}" --name main --query "properties.outputs.frontendUrl.value" -o tsv 2>/dev/null || echo "Check Azure Portal")
BACKEND_URL=$(az deployment group show --resource-group "${RESOURCE_GROUP}" --name main --query "properties.outputs.backendUrl.value" -o tsv 2>/dev/null || echo "Check Azure Portal")
SWAGGER_URL=$(az deployment group show --resource-group "${RESOURCE_GROUP}" --name main --query "properties.outputs.swaggerUrl.value" -o tsv 2>/dev/null || echo "Check Azure Portal")

echo "  Frontend URL : ${FRONTEND_URL}"
echo "  Backend API  : ${BACKEND_URL}"
echo "  Swagger UI   : ${SWAGGER_URL}"
echo "=========================================================="
