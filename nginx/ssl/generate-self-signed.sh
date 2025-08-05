#!/bin/bash

# Generate self-signed SSL certificates for development/testing
# This script creates certificates for the default nginx configuration

set -e

CERT_DIR="/etc/nginx/ssl"
DOMAIN="localhost"

echo "Generating self-signed SSL certificate for $DOMAIN..."

# Create SSL directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Generate private key
openssl genrsa -out "$CERT_DIR/default.key" 2048

# Generate certificate signing request
openssl req -new -key "$CERT_DIR/default.key" -out "$CERT_DIR/default.csr" -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"

# Generate self-signed certificate
openssl x509 -req -in "$CERT_DIR/default.csr" -signkey "$CERT_DIR/default.key" -out "$CERT_DIR/default.crt" -days 365

# Set proper permissions
chmod 600 "$CERT_DIR/default.key"
chmod 644 "$CERT_DIR/default.crt"

# Clean up CSR file
rm "$CERT_DIR/default.csr"

echo "Self-signed SSL certificate generated successfully!"
echo "Certificate: $CERT_DIR/default.crt"
echo "Private key: $CERT_DIR/default.key"
echo ""
echo "Note: This is a self-signed certificate for development only."
echo "For production, use Let's Encrypt or a proper CA-signed certificate."
