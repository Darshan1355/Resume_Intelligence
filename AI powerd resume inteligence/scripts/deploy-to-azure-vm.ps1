<#
.SYNOPSIS
    Deploys CareerMind AI Resume Intelligence platform to an Azure Linux Virtual Machine with Docker Compose.
.DESCRIPTION
    Creates resource group, virtual network, security rules (ports 80, 8080, 8000), provisions an Ubuntu VM,
    and automatically executes the Docker Compose stack (React frontend, Spring Boot backend, Python ML service, MySQL).
#>

[CmdletBinding()]
param(
    [string]$ResourceGroupName = "rg-careermind-india",
    [string]$Location = "centralindia",
    [string]$VmName = "careermind-vm",
    [string]$VmSize = "Standard_D2s_v3",
    [string]$AdminUsername = "azureuser"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CareerMind -> Azure Linux VM Deployment (Docker Compose)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify Azure CLI
if (-not (Get-Command "az" -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI ('az') is not installed."
}

# 2. Check Azure Login
Write-Host "`n[1/5] Verifying Azure Authentication..." -ForegroundColor Yellow
$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "Please log in to your Azure account..." -ForegroundColor Yellow
    az login --output none
    $account = az account show --output json | ConvertFrom-Json
}
Write-Host "Connected: $($account.name) ($($account.user.name))" -ForegroundColor Green

# 3. Create Resource Group in allowed region
Write-Host "`n[2/5] Creating Resource Group '$ResourceGroupName' in '$Location'..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location --output none
Write-Host "Resource Group ready." -ForegroundColor Green

# 4. Check or Create VM
Write-Host "`n[3/5] Checking Virtual Machine '$VmName'..." -ForegroundColor Yellow
$existingVm = az vm show --resource-group $ResourceGroupName --name $VmName --output json 2>$null
if (-not $existingVm) {
    Write-Host "Provisioning $VmSize Ubuntu VM..." -ForegroundColor Yellow
    az vm create `
        --resource-group $ResourceGroupName `
        --name $VmName `
        --image Ubuntu2204 `
        --size $VmSize `
        --admin-username $AdminUsername `
        --generate-ssh-keys `
        --public-ip-sku Standard `
        --output none
}
Write-Host "Virtual Machine is active." -ForegroundColor Green

# 5. Open Inbound Network Ports
Write-Host "`n[4/5] Opening Firewall Ports (80, 8080, 8000)..." -ForegroundColor Yellow
az vm open-port --resource-group $ResourceGroupName --name $VmName --port "80,8080,8000" --priority 1010 --output none
Write-Host "Ports 80, 8080, and 8000 opened." -ForegroundColor Green

# 6. Retrieve Public IP
$publicIp = az vm list-ip-addresses --resource-group $ResourceGroupName --name $VmName --query "[0].virtualMachine.network.publicIpAddresses[0].ipAddress" -o tsv
Write-Host "Public IP: $publicIp" -ForegroundColor Cyan

# 7. Execute VM setup script
Write-Host "`n[5/5] Deploying Docker microservices stack on VM..." -ForegroundColor Yellow
$scriptPath = Join-Path $PSScriptRoot "setup-vm.sh"
az vm run-command invoke `
    --resource-group $ResourceGroupName `
    --name $VmName `
    --command-id RunShellScript `
    --scripts "@$scriptPath" `
    --output json

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  CareerMind Deployment Complete!" -ForegroundColor Green
Write-Host "  Frontend Dashboard : http://$publicIp" -ForegroundColor White
Write-Host "  Backend API URL    : http://$publicIp:8080" -ForegroundColor White
Write-Host "  ML Microservice    : http://$publicIp:8000" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
