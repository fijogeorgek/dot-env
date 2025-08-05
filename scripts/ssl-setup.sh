#!/bin/bash

# Script to setup SSL certificates using Let's Encrypt
# Usage: ./scripts/ssl-setup.sh yourdomain.com your@email.com

set -e

DOMAIN=$1
EMAIL=$2
STAGING=${3:-false}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email> [staging]"
    echo "Example: $0 example.com admin@example.com"
    echo "Example (staging): $0 example.com admin@example.com true"
    exit 1
fi

echo "Setting up SSL certificate for: $DOMAIN"
echo "Email: $EMAIL"
echo "Staging mode: $STAGING"

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "Error: Docker services are not running. Please start them first:"
    echo "./docker-scripts.sh start"
    exit 1
fi

# Determine certbot server
if [ "$STAGING" = "true" ]; then
    CERTBOT_SERVER="--staging"
    echo "Using Let's Encrypt staging server (for testing)"
else
    CERTBOT_SERVER=""
    echo "Using Let's Encrypt production server"
fi

# Create directories for Let's Encrypt
echo "Creating directories for Let's Encrypt..."
docker-compose exec nginx mkdir -p /var/www/certbot
docker-compose exec nginx mkdir -p /etc/letsencrypt

# Test nginx configuration
echo "Testing nginx configuration..."
docker-compose exec nginx nginx -t

# Reload nginx to pick up any configuration changes
echo "Reloading nginx..."
docker-compose exec nginx nginx -s reload

# Obtain SSL certificate
echo "Obtaining SSL certificate from Let's Encrypt..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    $CERTBOT_SERVER \
    -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo "SSL certificate obtained successfully!"
    
    # Test nginx configuration with new certificate
    echo "Testing nginx configuration with SSL certificate..."
    docker-compose exec nginx nginx -t
    
    # Reload nginx to use the new certificate
    echo "Reloading nginx with SSL certificate..."
    docker-compose exec nginx nginx -s reload
    
    echo ""
    echo "SSL setup complete!"
    echo "Your site should now be accessible at: https://$DOMAIN"
    echo ""
    echo "Certificate renewal is handled automatically by the certbot container."
    echo "Certificates will be renewed when they have 30 days or less remaining."
else
    echo "Failed to obtain SSL certificate. Please check:"
    echo "1. Domain DNS is pointing to this server"
    echo "2. Port 80 is accessible from the internet"
    echo "3. Domain name is correct"
    echo ""
    echo "For testing, you can use staging mode:"
    echo "$0 $DOMAIN $EMAIL true"
fi
