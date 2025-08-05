# Kubernetes Deployment Guide

This guide covers deploying the dot-env SvelteKit application to Kubernetes.

## Prerequisites

### Required Tools
- **kubectl** - Kubernetes command-line tool
- **Docker** - For building container images
- **Kubernetes cluster** - Local (minikube, kind) or cloud (EKS, GKE, AKS)

### Optional Tools
- **Helm** - For cert-manager installation
- **k9s** - Terminal-based Kubernetes dashboard

## Quick Start

### 1. Prepare Your Environment

```bash
# Verify kubectl is configured
kubectl cluster-info

# Create namespace
kubectl apply -f k8s/namespace.yaml
```

### 2. Configure Secrets and ConfigMaps

Edit the following files with your actual values:

**k8s/secret.yaml:**
- Update base64-encoded database passwords
- Add your Axiom credentials
- Set your private API keys

**k8s/configmap.yaml:**
- Update domain name
- Set public environment variables

**k8s/cert-manager-issuer.yaml:**
- Replace `your-email@example.com` with your actual email

**k8s/ingress.yaml:**
- Replace `localhost` and `your-domain.com` with your actual domains

### 3. Build and Push Docker Image

```bash
# Build the image
docker build -t dot-env:latest .

# Tag for your registry (replace with your registry)
docker tag dot-env:latest your-registry/dot-env:latest

# Push to registry
docker push your-registry/dot-env:latest

# Update k8s/app-deployment.yaml with your image URL
```

### 4. Install cert-manager (for SSL certificates)

```bash
# Install cert-manager using kubectl
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=available --timeout=300s deployment/cert-manager -n cert-manager

# Deploy ClusterIssuer
./k8s-scripts.sh cert-manager
```

### 5. Deploy the Application

```bash
# Deploy all resources
./k8s-scripts.sh deploy

# Check deployment status
./k8s-scripts.sh status
```

## Deployment Architecture

```
Internet
    ↓
Ingress Controller (nginx)
    ↓
Nginx Service
    ↓
Nginx Pods (reverse proxy)
    ↓
App Service
    ↓
SvelteKit App Pods
    ↓
MySQL Service
    ↓
MySQL Pod + PVC
```

## Resource Overview

### Core Components
- **Namespace**: `dot-env` - Isolates all resources
- **ConfigMap**: Non-sensitive configuration
- **Secret**: Database credentials and API keys
- **PVC**: Persistent storage for MySQL data

### Application Stack
- **MySQL**: Database with persistent storage
- **SvelteKit App**: Node.js application (2 replicas)
- **Nginx**: Reverse proxy (2 replicas)
- **Adminer**: Database management tool (optional)

### Networking
- **Services**: Internal cluster communication
- **Ingress**: External access with SSL termination
- **cert-manager**: Automatic SSL certificate management

## Management Commands

### Using k8s-scripts.sh

```bash
# Deploy everything
./k8s-scripts.sh deploy

# Check status
./k8s-scripts.sh status

# View logs
./k8s-scripts.sh logs app
./k8s-scripts.sh logs mysql
./k8s-scripts.sh logs nginx

# Scale application
./k8s-scripts.sh scale app 3

# Restart services
./k8s-scripts.sh restart app
./k8s-scripts.sh restart all

# Port forwarding for local access
./k8s-scripts.sh port-forward app     # localhost:3000
./k8s-scripts.sh port-forward mysql   # localhost:3306
./k8s-scripts.sh port-forward adminer # localhost:8080

# Build and push image
DOCKER_REGISTRY=your-registry ./k8s-scripts.sh build
```

### Direct kubectl Commands

```bash
# Get all resources
kubectl get all -n dot-env

# Describe a pod
kubectl describe pod <pod-name> -n dot-env

# Execute commands in a pod
kubectl exec -it <pod-name> -n dot-env -- /bin/sh

# View persistent volumes
kubectl get pv,pvc -n dot-env

# Check ingress
kubectl get ingress -n dot-env
kubectl describe ingress dot-env-ingress -n dot-env
```

## Configuration

### Environment Variables

**ConfigMap (k8s/configmap.yaml):**
- `NODE_ENV`: Application environment
- `DATABASE_HOST`: MySQL service name
- `DOMAIN_NAME`: Your domain
- `PUBLIC_*`: Client-side environment variables

**Secret (k8s/secret.yaml):**
- `DATABASE_URL`: Complete database connection string
- `MYSQL_ROOT_PASSWORD`: MySQL root password
- `MYSQL_PASSWORD`: Application database password
- `DYNAMIC_PRIVATE_KEY`: Server-side API key
- `AXIOM_TOKEN`: Logging service token

### Resource Limits

**MySQL:**
- Memory: 512Mi request, 1Gi limit
- CPU: 250m request, 500m limit
- Storage: 10Gi persistent volume

**SvelteKit App:**
- Memory: 256Mi request, 512Mi limit
- CPU: 100m request, 500m limit

**Nginx:**
- Memory: 64Mi request, 128Mi limit
- CPU: 50m request, 100m limit

## SSL/TLS Configuration

### cert-manager Setup

1. **Install cert-manager** (if not already installed):
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. **Deploy ClusterIssuer**:
```bash
./k8s-scripts.sh cert-manager
```

3. **Verify certificates**:
```bash
kubectl get certificates -n dot-env
kubectl describe certificate dot-env-tls -n dot-env
```

### Manual Certificate Management

If not using cert-manager, create TLS secrets manually:

```bash
kubectl create secret tls dot-env-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n dot-env
```

## Monitoring and Troubleshooting

### Health Checks

All deployments include:
- **Liveness probes**: Restart unhealthy containers
- **Readiness probes**: Remove unhealthy pods from service

### Common Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n dot-env
kubectl logs <pod-name> -n dot-env
```

**Database connection issues:**
```bash
# Check MySQL pod logs
kubectl logs deployment/mysql -n dot-env

# Test database connectivity
kubectl exec -it deployment/dot-env-app -n dot-env -- nc -zv mysql-service 3306
```

**SSL certificate issues:**
```bash
# Check certificate status
kubectl get certificates -n dot-env
kubectl describe certificate dot-env-tls -n dot-env

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

### Performance Monitoring

```bash
# Resource usage
kubectl top pods -n dot-env
kubectl top nodes

# Horizontal Pod Autoscaler (optional)
kubectl autoscale deployment dot-env-app --cpu-percent=70 --min=2 --max=10 -n dot-env
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
kubectl exec deployment/mysql -n dot-env -- mysqldump -u root -p<password> dotenv > backup.sql

# Restore backup
kubectl exec -i deployment/mysql -n dot-env -- mysql -u root -p<password> dotenv < backup.sql
```

### Persistent Volume Backup

Follow your cloud provider's documentation for PV snapshots:
- **AWS**: EBS snapshots
- **GCP**: Persistent disk snapshots
- **Azure**: Disk snapshots

## Scaling and High Availability

### Horizontal Scaling

```bash
# Scale application pods
./k8s-scripts.sh scale app 5

# Scale nginx pods
./k8s-scripts.sh scale nginx 3
```

### Database High Availability

For production, consider:
- MySQL replication
- Cloud-managed databases (RDS, Cloud SQL, etc.)
- Database operators (MySQL Operator, Percona Operator)

## Security Best Practices

1. **Use secrets for sensitive data**
2. **Enable RBAC** in your cluster
3. **Network policies** for pod-to-pod communication
4. **Pod security policies** or Pod Security Standards
5. **Regular security updates** for base images
6. **Scan images** for vulnerabilities

## Migration from Docker Compose

### Key Differences

| Docker Compose | Kubernetes |
|----------------|------------|
| `docker-compose.yml` | Multiple YAML manifests |
| `volumes:` | PersistentVolumeClaims |
| `networks:` | Services + NetworkPolicies |
| `environment:` | ConfigMaps + Secrets |
| Port mapping | Ingress + Services |

### Migration Steps

1. **Build and push images** to a registry
2. **Convert environment variables** to ConfigMaps/Secrets
3. **Replace volumes** with PVCs
4. **Configure ingress** instead of port mapping
5. **Set up cert-manager** for SSL
6. **Test thoroughly** in staging environment

## Production Considerations

- **Use a container registry** (not local images)
- **Set up monitoring** (Prometheus, Grafana)
- **Configure logging** (ELK stack, Fluentd)
- **Implement backup strategies**
- **Set up CI/CD pipelines**
- **Use Helm charts** for complex deployments
- **Configure resource quotas** and limits
- **Set up alerting** for critical issues

## Support

For issues with this Kubernetes deployment:
1. Check the troubleshooting section above
2. Review pod logs and events
3. Verify cluster resources and permissions
4. Consult Kubernetes documentation
