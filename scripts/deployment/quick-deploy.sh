#!/bin/bash

# Hızlı Deployment Script
# Bu script uygulamayı hızlıca VPS'e deploy eder

echo "🚀 Hızlı deployment başlatılıyor..."

# VPS'e bağlanın ve bu komutları çalıştırın:

# 1. Sistemi güncelleyin
sudo apt update && sudo apt upgrade -y

# 2. Gerekli paketleri kurun
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git

# 3. Uygulamayı klonlayın
sudo mkdir -p /var/www/yksquiz.fun
sudo git clone https://github.com/YKSQuiz/yksquizfun.git /var/www/yksquiz.fun
sudo chown -R $USER:$USER /var/www/yksquiz.fun

# 4. Bağımlılıkları kurun ve build edin
cd /var/www/yksquiz.fun
npm ci --production=false
npm run build

# 5. Web dizinini oluşturun
sudo mkdir -p /var/www/yksquiz.fun/public
sudo cp -r build/* /var/www/yksquiz.fun/public/
sudo chown -R www-data:www-data /var/www/yksquiz.fun/public

# 6. Nginx konfigürasyonu
sudo tee /etc/nginx/sites-available/yksquiz.fun << EOF
server {
    listen 80;
    server_name www.yksquiz.fun yksquiz.fun;
    root /var/www/yksquiz.fun/public;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# 7. Site'ı etkinleştirin
sudo ln -sf /etc/nginx/sites-available/yksquiz.fun /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl reload nginx

echo "✅ Deployment tamamlandı!"
echo "🌐 Uygulama: http://yksquiz.fun"
echo "🔒 SSL için: sudo certbot --nginx -d www.yksquiz.fun -d yksquiz.fun" 