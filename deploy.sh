#!/bin/bash
set -e

echo "Starting VextoralMining Deployment on Hostinger..."

if command -v node >/dev/null 2>&1; then
    echo "Node.js is installed: $(node -v)"
else
    echo "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

echo "Building Backend..."
cd backend
npm install
npm run build
cd ..

echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Starting Backend with PM2..."
pm2 start ecosystem.config.cjs || pm2 restart ecosystem.config.cjs
pm2 save

echo "VextoralMining deployed successfully on Hostinger!"
