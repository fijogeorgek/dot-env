# Nginx Setup for dot-env Project

This document explains how to use nginx as a reverse proxy with SSL certificate support for the dot-env SvelteKit application.

## Overview

The nginx setup provides:
- **Reverse proxy** for the SvelteKit application
- **SSL/TLS termination** with Let's Encrypt certificates
- **HTTP to HTTPS redirection**
- **Security headers** and rate limiting
- **Static asset caching**
- **WebSocket support** for SvelteKit features

## Quick Start

### 1. Basic Setup (Development)

```bash
# Start all services including nginx
./docker-scripts.sh start
```

This will start nginx with a self-signed certificate. Access your app at:
- **HTTPS**: https://localhost (self-signed certificate warning expected)
- **HTTP**: http://localhost (redirects to HTTPS)

### 2. Production Setup with Domain

```bash
# Setup domain configuration
./docker-scripts.sh setup-domain yourdomain.com admin@yourdomain.com

# Start services
./docker-scripts.sh start

# Setup SSL certificate (after DNS is configured)
./docker-scripts.sh setup-ssl yourdomain.com admin@yourdomain.com
```

## Services

### Nginx Service
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Container**: `dot-env-nginx`
- **Image**: `nginx:alpine`
- **Configuration**: `./nginx/`

### Certbot Service
- **Container**: `dot-env-certbot`
- **Image**: `certbot/certbot`
- **Purpose**: Automatic SSL certificate renewal

## Configuration Files

### Main Configuration
- `nginx/nginx.conf` - Main nginx configuration
- `nginx/conf.d/default.conf` - Default server (catches unmatched domains)
- `nginx/conf.d/app.conf.template` - Application server template

### SSL Certificates
- `nginx/ssl/` - Self-signed certificates for development
- `/etc/letsencrypt/` - Let's Encrypt certificates (in Docker volume)

## Domain Setup

### Prerequisites
1. **Domain ownership** - You must own the domain
2. **DNS configuration** - Point your domain to your server's IP
3. **Port access** - Ports 80 and 443 must be accessible from the internet

### Step-by-Step Setup

1. **Configure DNS**:
   ```
   A record: yourdomain.com → your.server.ip.address
   ```

2. **Setup domain configuration**:
   ```bash
   ./docker-scripts.sh setup-domain yourdomain.com admin@yourdomain.com
   ```

3. **Start services**:
   ```bash
   ./docker-scripts.sh start
   ```

4. **Obtain SSL certificate**:
   ```bash
   ./docker-scripts.sh setup-ssl yourdomain.com admin@yourdomain.com
   ```

### Testing with Staging

For testing, use Let's Encrypt staging environment to avoid rate limits:

```bash
./docker-scripts.sh setup-ssl yourdomain.com admin@yourdomain.com true
```

## SSL Certificate Management

### Automatic Renewal
Certificates are automatically renewed by the certbot container when they have 30 days or less remaining.

### Manual Renewal
```bash
docker-compose exec certbot certbot renew
./docker-scripts.sh reload-nginx
```

### Certificate Status
```bash
docker-compose exec certbot certbot certificates
```

## Security Features

### Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting
- **API endpoints**: 10 requests/second with burst of 20
- **Login endpoints**: 5 requests/minute

### SSL Configuration
- **Protocols**: TLSv1.2, TLSv1.3
- **Ciphers**: Modern, secure cipher suites
- **HSTS**: Optional (commented out by default)

## Performance Optimizations

### Caching
- **Static assets**: 1 year cache with immutable flag
- **Gzip compression**: Enabled for text-based content

### Proxy Settings
- **Keep-alive connections**: Enabled
- **Buffer optimization**: Configured for optimal performance
- **WebSocket support**: Full support for SvelteKit features

## Troubleshooting

### Common Issues

#### 1. Certificate Errors
```bash
# Check certificate status
docker-compose exec certbot certbot certificates

# Test nginx configuration
docker-compose exec nginx nginx -t

# Check nginx logs
docker-compose logs nginx
```

#### 2. Domain Not Accessible
- Verify DNS configuration: `nslookup yourdomain.com`
- Check firewall settings (ports 80, 443)
- Verify nginx is running: `docker-compose ps nginx`

#### 3. SSL Certificate Fails
- Ensure domain points to your server
- Check port 80 is accessible (required for Let's Encrypt)
- Try staging mode first: `setup-ssl domain email true`

### Useful Commands

```bash
# Reload nginx configuration
./docker-scripts.sh reload-nginx

# View nginx logs
./docker-scripts.sh logs nginx

# Test nginx configuration
docker-compose exec nginx nginx -t

# Check SSL certificate expiry
docker-compose exec certbot certbot certificates

# Force certificate renewal
docker-compose exec certbot certbot renew --force-renewal
```

## Development vs Production

### Development
- Uses self-signed certificates
- Domain: `localhost`
- No rate limiting on development endpoints

### Production
- Uses Let's Encrypt certificates
- Custom domain configuration
- Full security headers and rate limiting
- HSTS (optional, can be enabled)

## Advanced Configuration

### Custom Nginx Configuration
To customize nginx configuration:

1. Edit files in `nginx/conf.d/`
2. Test configuration: `docker-compose exec nginx nginx -t`
3. Reload: `./docker-scripts.sh reload-nginx`

### Multiple Domains
To support multiple domains, create additional configuration files in `nginx/conf.d/`:

```bash
cp nginx/conf.d/app.conf.template nginx/conf.d/domain2.conf
# Edit domain2.conf with your second domain
```

### Custom SSL Certificates
To use custom SSL certificates instead of Let's Encrypt:

1. Place your certificates in `nginx/ssl/`
2. Update the nginx configuration to reference your certificates
3. Reload nginx configuration

## Monitoring

### Health Checks
- Nginx health: `curl -f http://localhost/health`
- SSL certificate expiry monitoring via certbot logs

### Logs
- Nginx access logs: `docker-compose logs nginx`
- Certbot renewal logs: `docker-compose logs certbot`

## Security Best Practices

1. **Keep nginx updated**: Regularly update the nginx Docker image
2. **Monitor certificates**: Set up alerts for certificate expiry
3. **Review logs**: Regularly check access and error logs
4. **Rate limiting**: Adjust rate limits based on your needs
5. **Security headers**: Enable HSTS in production if appropriate

## Next Steps

1. Configure your domain's DNS
2. Run domain setup script
3. Obtain SSL certificates
4. Test your configuration
5. Set up monitoring and alerting
6. Consider additional security measures (WAF, DDoS protection)
