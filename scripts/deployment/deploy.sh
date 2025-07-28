#!/bin/bash

# YKS Quiz Deployment Script for Hostinger VPS
# Bu script uygulamayı VPS'e deploy eder

set -e  # Hata durumunda script'i durdur

echo "🚀 YKS Quiz Deployment başlatılıyor..."

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Değişkenler
REPO_URL="https://github.com/YKSQuiz/yksquizfun.git"
DEPLOY_DIR="/var/www/yksquiz.fun"
BACKUP_DIR="/var/www/backups"
DOMAIN="yksquiz.fun"

# Log fonksiyonu
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Gerekli paketleri kontrol et ve kur
check_dependencies() {
    log "Gerekli paketler kontrol ediliyor..."
    
    # Node.js kontrolü
    if ! command -v node &> /dev/null; then
        log "Node.js kuruluyor..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        log "Node.js zaten kurulu: $(node --version)"
    fi
    
    # Nginx kontrolü
    if ! command -v nginx &> /dev/null; then
        log "Nginx kuruluyor..."
        sudo apt-get update
        sudo apt-get install -y nginx
    else
        log "Nginx zaten kurulu: $(nginx -v)"
    fi
    
    # Git kontrolü
    if ! command -v git &> /dev/null; then
        log "Git kuruluyor..."
        sudo apt-get install -y git
    else
        log "Git zaten kurulu: $(git --version)"
    fi
}

# Backup oluştur
create_backup() {
    if [ -d "$DEPLOY_DIR" ]; then
        log "Mevcut uygulama yedekleniyor..."
        sudo mkdir -p "$BACKUP_DIR"
        sudo cp -r "$DEPLOY_DIR" "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)"
        log "Backup oluşturuldu: $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    fi
}

# Uygulamayı klonla veya güncelle
clone_or_update() {
    if [ -d "$DEPLOY_DIR" ]; then
        log "Mevcut repository güncelleniyor..."
        cd "$DEPLOY_DIR"
        git fetch origin
        git reset --hard origin/main
    else
        log "Repository klonlanıyor..."
        sudo mkdir -p "$DEPLOY_DIR"
        sudo git clone "$REPO_URL" "$DEPLOY_DIR"
        sudo chown -R $USER:$USER "$DEPLOY_DIR"
    fi
}

# Bağımlılıkları kur
install_dependencies() {
    log "Bağımlılıklar kuruluyor..."
    cd "$DEPLOY_DIR"
    npm ci --production=false
    log "Bağımlılıklar kuruldu"
}

# Uygulamayı build et
build_application() {
    log "Uygulama build ediliyor..."
    cd "$DEPLOY_DIR"
    
    # Environment variables
    export CI=false
    export NODE_ENV=production
    
    npm run build
    log "Build tamamlandı"
}

# Build dosyalarını web dizinine kopyala
deploy_files() {
    log "Dosyalar web dizinine kopyalanıyor..."
    
    # Web dizinini temizle
    sudo rm -rf "$DEPLOY_DIR/public"
    sudo mkdir -p "$DEPLOY_DIR/public"
    
    # Build dosyalarını kopyala
    sudo cp -r "$DEPLOY_DIR/build/"* "$DEPLOY_DIR/public/"
    
    # İzinleri ayarla
    sudo chown -R www-data:www-data "$DEPLOY_DIR/public"
    sudo chmod -R 755 "$DEPLOY_DIR/public"
    
    log "Dosyalar kopyalandı"
}

# Nginx konfigürasyonunu güncelle
update_nginx() {
    log "Nginx konfigürasyonu güncelleniyor..."
    
    # Nginx konfigürasyonu oluştur
    sudo tee /etc/nginx/sites-available/yksquiz.fun << EOF
server {
    listen 80;
    server_name www.yksquiz.fun yksquiz.fun;
    
    root /var/www/yksquiz.fun/public;
    index index.html;
    
    # Gzip sıkıştırma
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache ayarları
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router için SPA konfigürasyonu
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Firebase ve diğer gerekli domainler için CORS
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
}
EOF

    # Site'ı etkinleştir
    sudo ln -sf /etc/nginx/sites-available/yksquiz.fun /etc/nginx/sites-enabled/
    
    # Default site'ı devre dışı bırak
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Nginx konfigürasyonunu test et
    if sudo nginx -t; then
        log "Nginx konfigürasyonu başarılı"
        sudo systemctl reload nginx
        log "Nginx yeniden başlatıldı"
    else
        error "Nginx konfigürasyonu hatası!"
    fi
}

# SSL sertifikası kur (opsiyonel)
setup_ssl() {
    log "SSL sertifikası kurulumu..."
    
    # Certbot kur
    if ! command -v certbot &> /dev/null; then
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # SSL sertifikası al
    sudo certbot --nginx -d www.yksquiz.fun -d yksquiz.fun --non-interactive --agree-tos --email admin@yksquiz.fun
    
    log "SSL sertifikası kuruldu"
}

# Health check
health_check() {
    log "Uygulama sağlık kontrolü yapılıyor..."
    
    # HTTP response kontrolü
    if curl -f -s http://localhost > /dev/null; then
        log "✅ Uygulama başarıyla çalışıyor"
    else
        warning "⚠️  Uygulama yanıt vermiyor, kontrol edin"
    fi
}

# Ana deployment fonksiyonu
main() {
    log "Deployment başlatılıyor..."
    
    check_dependencies
    create_backup
    clone_or_update
    install_dependencies
    build_application
    deploy_files
    update_nginx
    health_check
    
    log "🎉 Deployment tamamlandı!"
    log "🌐 Uygulama: https://www.yksquiz.fun"
    log "📁 Deploy dizini: $DEPLOY_DIR"
    log "📁 Backup dizini: $BACKUP_DIR"
    
    echo ""
    echo "SSL sertifikası kurmak için:"
    echo "sudo certbot --nginx -d www.yksquiz.fun -d yksquiz.fun"
    echo ""
    echo "Logları kontrol etmek için:"
    echo "sudo tail -f /var/log/nginx/error.log"
    echo "sudo tail -f /var/log/nginx/access.log"
}

# Script'i çalıştır
main "$@" 