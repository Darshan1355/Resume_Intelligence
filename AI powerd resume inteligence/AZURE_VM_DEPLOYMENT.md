# CareerMind AI Platform — Azure Linux VM Deployment Guide

This guide documents the production deployment of **CareerMind (AI Resume Intelligence & Job Matching Platform)** onto **Microsoft Azure Virtual Machine** using **Docker Compose**.

---

## 1. Why Azure VM Deployment?

Earlier attempts to deploy to Azure Container Apps encountered policy and registration roadblocks:
1. **Azure Provider Registration**: `Microsoft.App` (Azure Container Apps) was stuck in `Unregistered` / long `Registering` state and restricted under the student subscription.
2. **Azure Policy Region Restrictions**: The active `Azure for Students` subscription enforces an Azure Policy restricting deployments to approved regions (`centralindia`, `uaenorth`, `koreacentral`, `malaysiawest`, `austriaeast`). Deploying to `eastus` was rejected by policy.

### The Solution: Azure Linux Virtual Machine with Docker Compose
- **Zero Microsoft.App Dependency**: Utilizes `Microsoft.Compute`, `Microsoft.Network`, and `Microsoft.Storage` which are fully registered and approved.
- **Ultra-Fast & High Performance**: Deployed in `centralindia` on a **`Standard_D2s_v3`** instance (2 vCPUs, 8 GB RAM) with an additional 4 GB swap file.
- **Self-Contained Microservices**: Runs the exact local-production parity microservice stack using Docker Compose:
  - **careermind-frontend**: React 18 + Vite + Tailwind CSS + Nginx reverse proxy (Port 80)
  - **careermind-backend**: Spring Boot 3.2.4 + Java 17 + JWT Authentication (Port 8080)
  - **careermind-ml**: Python FastAPI + PyTorch + SentenceTransformers (Port 8000)
  - **careermind-mysql**: MySQL 8.0 with pre-loaded `careermind_db` schema (Port 3306)

---

## 2. Infrastructure Architecture

```mermaid
flowchart TB
    subgraph Internet [Public Internet]
        User([End User / Browser])
    end

    subgraph Azure [Microsoft Azure — Region: Central India]
        subgraph RG [Resource Group: rg-careermind-india]
            subgraph NSG [Network Security Group: careermind-vmNSG]
                Port80[Allow Port 80 - HTTP]
                Port8080[Allow Port 8080 - Backend API]
                Port8000[Allow Port 8000 - ML API]
                Port22[Allow Port 22 - SSH]
            end

            subgraph VM [Azure Linux VM: careermind-vm (Standard_D2s_v3: 2 vCPUs, 8GB RAM)]
                subgraph DockerNet [Docker Bridge Network: careermind-net]
                    FE[careermind-frontend\nNginx :80]
                    BE[careermind-backend\nSpring Boot :8080]
                    ML[careermind-ml\nFastAPI :8000]
                    DB[(careermind-mysql\nMySQL 8.0 :3306)]
                end
            end
        end
    end

    User -->|HTTP :80| FE
    User -.->|Direct API :8080| BE
    FE -->|Proxy /api/| BE
    BE -->|Internal HTTP :8000| ML
    BE -->|Internal JDBC :3306| DB
```

---

## 3. Live Endpoints

| Component | URL | Description |
|---|---|---|
| **Frontend Web App** | `http://4.247.183.188` | CareerMind React UI & Dashboard |
| **Backend REST API** | `http://4.247.183.188:8080/api` | Spring Boot API |
| **API Swagger Docs** | `http://4.247.183.188:8080/swagger-ui.html` | Interactive API documentation |
| **ML Microservice** | `http://4.247.183.188:8000/docs` | FastAPI documentation & health endpoints |

---

## 4. Useful Management Commands

### Connect via SSH
To SSH into your Azure VM from PowerShell:
```powershell
ssh -i ~/.ssh/id_rsa azureuser@4.247.183.188
```

### View Live Logs
```bash
# Frontend Nginx logs
sudo docker logs -f careermind-frontend

# Spring Boot backend logs
sudo docker logs -f careermind-backend

# FastAPI ML service logs
sudo docker logs -f careermind-ml

# MySQL logs
sudo docker logs -f careermind-mysql
```

### Restart All Microservices
```bash
cd "/opt/Resume_Intelligence/AI powerd resume inteligence"
sudo docker compose restart
```

### Pull Latest Code & Rebuild
```bash
cd "/opt/Resume_Intelligence/AI powerd resume inteligence"
sudo git pull origin main
sudo docker compose up -d --build
```

### Stop or Start the Azure VM (Cost Management)
When you are not using the VM, you can deallocate it to avoid burning Azure student credits:
```powershell
# Stop/Deallocate VM (compute billing stops)
az vm deallocate --resource-group rg-careermind-india --name careermind-vm

# Start VM when ready
az vm start --resource-group rg-careermind-india --name careermind-vm
```
