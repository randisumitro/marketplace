#!/bin/bash
set -e

echo "🚀 Memulai proses deployment ke server produksi..."

SERVER="admincafe@139.190.97.60"
WEB_ROOT="/www/wwwroot/tech.rand.com"

# Pastikan environment frontend sudah disiapkan
if [ ! -f "client/.env.production" ]; then
  echo "⚠️  client/.env.production tidak ditemukan! Membuat otomatis..."
  echo "VITE_API_URL=https://janjingopi.web.id" > client/.env.production
fi

echo "📦 1/3 Mengunggah file (rsync) ke server..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --rsync-path="sudo rsync" \
  ./ $SERVER:$WEB_ROOT/

echo "⚙️  2/3 Membangun backend dan merestart layanan..."
ssh $SERVER "cd $WEB_ROOT/server && sudo npm install && sudo npm run build && sudo pm2 restart oneshop-backend"

echo "🎨 3/3 Membangun frontend dan memperbarui folder public..."
ssh $SERVER "cd $WEB_ROOT/client && sudo npm install && sudo npm run build && sudo mkdir -p ../public && sudo rsync -a dist/ ../public/ && sudo chown -R www:www ../public"

echo "✅ Deployment selesai! https://janjingopi.web.id sudah diperbarui."
