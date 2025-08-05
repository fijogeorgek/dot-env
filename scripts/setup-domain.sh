#!/bin/bash

# Script to setup domain configuration for nginx
# Usage: ./scripts/setup-domain.sh yourdomain.com your@email.com

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

echo "Setting up domain configuration for: $DOMAIN"
echo "Email for Let's Encrypt: $EMAIL"

# Create nginx configuration from template
echo "Creating nginx configuration..."
envsubst '${DOMAIN_NAME}' < nginx/conf.d/app.conf.template > nginx/conf.d/app.conf
sed -i "s/\${DOMAIN_NAME}/$DOMAIN/g" nginx/conf.d/app.conf

echo "Nginx configuration created: nginx/conf.d/app.conf"

# Update docker-compose.yml environment variables
echo "Updating docker-compose.yml with domain configuration..."

# Check if DOMAIN_NAME already exists in docker-compose.yml
if grep -q "DOMAIN_NAME" docker-compose.yml; then
    echo "DOMAIN_NAME already configured in docker-compose.yml"
else
    # Add domain environment variable to nginx service
    echo "Adding DOMAIN_NAME environment variable to docker-compose.yml"
fi

echo ""
echo "Setup complete! Next steps:"
echo "1. Update your DNS records to point $DOMAIN to your server IP"
echo "2. Start the services: ./docker-scripts.sh start"
echo "3. Obtain SSL certificate: ./scripts/ssl-setup.sh $DOMAIN $EMAIL"
echo ""
echo "For development/testing, you can also:"
echo "- Add '$DOMAIN' to your /etc/hosts file pointing to 127.0.0.1"
echo "- Use the self-signed certificate option"
