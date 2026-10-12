<#
.SYNOPSIS
    Deploys CareerMind AI Resume Intelligence platform to Microsoft Azure.
.DESCRIPTION
    Automates Azure Resource Group creation, cloud image building in Azure Container Registry (ACR),
    and Bicep infrastructure deployment (Azure Container Apps + Azure Database for MySQL Flexible Server).
#>

[CmdletBinding()]
param(
    [string]$ResourceGroupName = "rg-careermind-prod",
    [string]$Location = "eastus",
    [string]$Prefix = "careermind",
    [string]$Environment = "prod",
    [string]$DbPassword = "CareerMindSecure2026!#",
    [string]$JwtSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CareerMind -> Microsoft Azure One-Click Deployment     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify Azure CLI is installed
if (-not (Get-Command "az" -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI ('az') is not installed. Please install it from https://aka.ms/installazurecliwindows"
}

# 2. Check Azure Login
Write-Host "`n[1/6] Verifying Azure Authentication..." -ForegroundColor Yellow
$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "Not logged in. Initiating Azure login..." -ForegroundColor Yellow
    az login --output none
    $account = az account show --output json | ConvertFrom-Json
}
Write-Host "Connected to Subscription: $($account.name) ($($account.id))" -ForegroundColor Green

# 3. Create Resource Group
Write-Host "`n[2/6] Ensuring Resource Group '$ResourceGroupName' in '$Location'..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location --output none
Write-Host "Resource Group ready." -ForegroundColor Green

# 4. Create or Get Azure Container Registry (ACR)
Write-Host "`n[3/6] Setting up Azure Container Registry..." -ForegroundColor Yellow
$uniqueHash = [BitConverter]::ToString([System.Security.Cryptography.MD5]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($ResourceGroupName))).Replace("-", "").Substring(0, 6).ToLower()
$acrName = "$($Prefix)acr$uniqueHash"

$existingAcr = az acr show --name $acrName --resource-group $ResourceGroupName --query "name" --output tsv 2>$null
if (-not $existingAcr) {
    Write-Host "Creating ACR '$acrName'..." -ForegroundColor Yellow
    az acr create --resource-group $ResourceGroupName --name $acrName --sku Basic --admin-enabled true --location $Location --output none
}
$acrLoginServer = az acr show --name $acrName --resource-group $ResourceGroupName --query "loginServer" --output tsv
Write-Host "ACR Login Server: $acrLoginServer" -ForegroundColor Green

# 5. Cloud-native build of Docker images inside Azure ACR
Write-Host "`n[4/6] Building Docker Images in Azure Cloud (ACR Tasks)..." -ForegroundColor Yellow

Write-Host "-> Building ML Microservice image (careermind-ml-service)..." -ForegroundColor Cyan
az acr build --registry $acrName --image "careermind-ml-service:$ImageTag" ./ml-service

Write-Host "-> Building Spring Boot Backend image (careermind-backend)..." -ForegroundColor Cyan
az acr build --registry $acrName --image "careermind-backend:$ImageTag" ./backend

Write-Host "-> Building React Frontend image (careermind-frontend)..." -ForegroundColor Cyan
az acr build --registry $acrName --image "careermind-frontend:$ImageTag" ./frontend

Write-Host "All images successfully built and pushed to ACR!" -ForegroundColor Green

# 6. Deploy Infrastructure via Bicep
Write-Host "`n[5/6] Deploying Azure Container Apps & Managed MySQL via Bicep..." -ForegroundColor Yellow
$deployment = az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file ./azure/bicep/main.bicep `
    --parameters location=$Location `
                 prefix=$Prefix `
                 environment=$Environment `
                 dbAdminPassword=$DbPassword `
                 jwtSecret=$JwtSecret `
                 imageTag=$ImageTag `
    --output json | ConvertFrom-Json

# 7. Print Deployment Summary
Write-Host "`n[6/6] Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Frontend URL : $($deployment.properties.outputs.frontendUrl.value)" -ForegroundColor White
Write-Host "  Backend API  : $($deployment.properties.outputs.backendUrl.value)" -ForegroundColor White
Write-Host "  Swagger UI   : $($deployment.properties.outputs.swaggerUrl.value)" -ForegroundColor White
Write-Host "  MySQL Host   : $($deployment.properties.outputs.mysqlHost.value)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
