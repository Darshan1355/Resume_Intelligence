#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo " Starting CareerMind AI Platform Deployment on Azure VM   "
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive

echo "--> [1/5] Configuring 4GB Swap Space..."
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Swap space successfully configured."
else
    echo "Swap file already exists."
fi

echo "--> [2/5] Updating packages and installing prerequisites..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release git

echo "--> [3/5] Installing Docker Engine and Docker Compose..."
if ! command -v docker &> /dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

systemctl enable docker
systemctl start docker
usermod -aG docker azureuser || true

echo "--> [4/5] Syncing CareerMind Repository..."
mkdir -p /opt
cd /opt
if [ -d "/opt/Resume_Intelligence" ]; then
    cd /opt/Resume_Intelligence
    git fetch origin main
    git reset --hard origin/main
else
    git clone https://github.com/Darshan1355/Resume_Intelligence.git /opt/Resume_Intelligence
    cd /opt/Resume_Intelligence
fi

PROJECT_DIR="/opt/Resume_Intelligence/AI powerd resume inteligence"
cd "$PROJECT_DIR"

echo "--> [5/5] Building and launching CareerMind Microservices..."
docker compose down || true
docker compose up -d --build

echo "=========================================================="
echo " Checking Container Status                               "
echo "=========================================================="
docker compose ps

echo "CareerMind deployment completed successfully!"
