# Docker Setup for dot-env Project

This document explains how to run the dot-env SvelteKit application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Quick Start

1. **Setup environment variables:**

   ```bash
   cp .env.docker .env
   # Edit .env file with your actual values
   ```

2. **Start the application:**

   ```bash
   ./docker-scripts.sh start
   ```

3. **Access the application:**
   - Application (via nginx): https://localhost
   - Application (direct): http://localhost:3000
   - Database Admin (Adminer): http://localhost:8080
   - Database: localhost:3306

## Services

The Docker setup includes five services:

### 1. Nginx Reverse Proxy (`nginx`)

- **Ports:** 80 (HTTP), 443 (HTTPS)
- **Description:** Nginx reverse proxy with SSL termination
- **Features:** SSL certificates, security headers, caching, rate limiting

### 2. Let's Encrypt Certbot (`certbot`)

- **Description:** Automatic SSL certificate management
- **Features:** Certificate issuance and renewal

### 3. Application (`app`)

- **Port:** 3000 (internal)
- **Description:** SvelteKit Node.js application
- **Health Check:** HTTP GET to localhost:3000

### 4. Database (`db`)

- **Port:** 3306
- **Description:** MySQL 8.0 database
- **Credentials:**
  - Root password: `rootpassword`
  - Database: `dotenv`
  - User: `dotenv_user`
  - Password: `dotenv_password`

### 5. Database Admin (`adminer`)

- **Port:** 8080
- **Description:** Web-based database administration tool
- **Access:** http://localhost:8080

## Environment Variables

The application uses the following environment variables:

### Required

- `DATABASE_URL`: MySQL connection string
- `NODE_ENV`: Environment (production/development)

### Optional

- `DYNAMIC_PRIVATE_KEY`: Server-side dynamic key
- `PUBLIC_DYNAMIC_KEY`: Client-side dynamic key
- `STATIC_PRIVATE_KEY`: Build-time private key
- `PUBLIC_STATIC_KEY`: Build-time public key
- `AXIOM_TOKEN`: Axiom logging API token
- `AXIOM_DATASET`: Axiom dataset name

## Management Scripts

Use the provided `docker-scripts.sh` for easy management:

```bash
# Start all services
./docker-scripts.sh start

# Stop all services
./docker-scripts.sh stop

# Restart all services
./docker-scripts.sh restart

# View logs (all services)
./docker-scripts.sh logs

# View logs for specific service
./docker-scripts.sh logs app
./docker-scripts.sh logs db

# Run database migrations
./docker-scripts.sh migrate

# Open Drizzle Studio
./docker-scripts.sh studio

# Clean up everything (removes volumes!)
./docker-scripts.sh cleanup

# Setup domain and SSL (production)
./docker-scripts.sh setup-domain yourdomain.com admin@yourdomain.com
./docker-scripts.sh setup-ssl yourdomain.com admin@yourdomain.com

# Reload nginx configuration
./docker-scripts.sh reload-nginx
```

## Manual Docker Commands

If you prefer using Docker Compose directly:

```bash
# Build and start services
docker-compose up --build -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Execute commands in containers
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:studio
docker-compose exec db mysql -u root -p
```

## Database Management

### Accessing the Database

1. **Via Adminer (Web Interface):**
   - Go to http://localhost:8080
   - Server: `db`
   - Username: `dotenv_user`
   - Password: `dotenv_password`
   - Database: `dotenv`

2. **Via MySQL Client:**

   ```bash
   mysql -h localhost -P 3306 -u dotenv_user -p dotenv
   ```

3. **Via Docker:**
   ```bash
   docker-compose exec db mysql -u dotenv_user -p dotenv
   ```

### Running Migrations

```bash
# Using the script
./docker-scripts.sh migrate

# Or directly
docker-compose exec app npm run db:migrate
```

### Database Studio

```bash
# Using the script
./docker-scripts.sh studio

# Or directly
docker-compose exec app npm run db:studio
```

## Nginx and SSL Setup

### Development (Self-Signed Certificate)

The nginx service automatically generates a self-signed certificate for development:

```bash
./docker-scripts.sh start
# Access via: https://localhost (expect certificate warning)
```

### Production (Let's Encrypt Certificate)

For production with a real domain:

1. **Configure DNS**: Point your domain to your server's IP address
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

### Testing SSL Setup

Use Let's Encrypt staging environment for testing:

```bash
./docker-scripts.sh setup-ssl yourdomain.com admin@yourdomain.com true
```

### Nginx Management

```bash
# Test nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx (after config changes)
./docker-scripts.sh reload-nginx

# View nginx logs
./docker-scripts.sh logs nginx
```

## Volumes

The setup uses Docker volumes for data persistence:

- `mysql_data`: MySQL database files
- `app_data`: Application data (if needed)
- `certbot_www`: Let's Encrypt challenge files
- `certbot_conf`: SSL certificates and Let's Encrypt configuration

## Networking

All services communicate through a custom Docker network (`app-network`).

## Troubleshooting

### Services Won't Start

1. Check if ports are already in use:

   ```bash
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :3306
   netstat -tulpn | grep :8080
   ```

2. Check Docker logs:
   ```bash
   docker-compose logs
   ```

### Database Connection Issues

1. Ensure the database service is healthy:

   ```bash
   docker-compose ps
   ```

2. Check database logs:

   ```bash
   docker-compose logs db
   ```

3. Verify environment variables in `.env` file

### Application Errors

1. Check application logs:

   ```bash
   docker-compose logs app
   ```

2. Verify all environment variables are set correctly

3. Ensure database migrations have been run:
   ```bash
   ./docker-scripts.sh migrate
   ```

## Development vs Production

### Development

- Use `docker-compose.override.yml` for development-specific settings
- Mount source code as volumes for hot reloading
- Use development database credentials

### Production

- Use production environment variables
- Ensure proper secrets management
- Use production-grade database setup
- Configure proper logging and monitoring

## Security Considerations

1. **Change default passwords** in production
2. **Use secrets management** for sensitive data
3. **Limit network exposure** of database ports
4. **Use HTTPS** in production
5. **Regular security updates** for base images

## Backup and Recovery

### Database Backup

```bash
docker-compose exec db mysqldump -u root -p dotenv > backup.sql
```

### Database Restore

```bash
docker-compose exec -T db mysql -u root -p dotenv < backup.sql
```

## Monitoring

Consider adding monitoring services like:

- Prometheus + Grafana for metrics
- ELK Stack for log aggregation
- Health check endpoints

## Next Steps

1. Customize environment variables in `.env`
2. Add any additional services you need
3. Set up CI/CD pipeline for automated deployments
4. Configure production-grade database setup
5. Add monitoring and alerting
