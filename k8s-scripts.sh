#!/bin/bash

# Kubernetes deployment and management scripts for dot-env SvelteKit application
# Usage: ./k8s-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="dot-env"
APP_NAME="dot-env-sveltekit"
IMAGE_NAME="dot-env"
IMAGE_TAG="latest"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
}

# Check if namespace exists
check_namespace() {
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log_warning "Namespace $NAMESPACE does not exist. Creating it..."
        kubectl apply -f k8s/namespace.yaml
    fi
}

# Deploy all resources
deploy() {
    log_info "Deploying $APP_NAME to Kubernetes..."
    
    check_kubectl
    check_namespace
    
    # Apply configurations in order
    log_info "Applying ConfigMaps and Secrets..."
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secret.yaml
    kubectl apply -f k8s/mysql-init-configmap.yaml
    
    log_info "Deploying MySQL database..."
    kubectl apply -f k8s/mysql-pvc.yaml
    kubectl apply -f k8s/mysql-deployment.yaml
    kubectl apply -f k8s/mysql-service.yaml
    
    log_info "Waiting for MySQL to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/mysql -n $NAMESPACE
    
    log_info "Deploying SvelteKit application..."
    kubectl apply -f k8s/app-deployment.yaml
    kubectl apply -f k8s/app-service.yaml
    
    log_info "Deploying Nginx reverse proxy..."
    kubectl apply -f k8s/nginx-configmap.yaml
    kubectl apply -f k8s/nginx-deployment.yaml
    kubectl apply -f k8s/nginx-service.yaml
    
    log_info "Deploying Ingress..."
    kubectl apply -f k8s/ingress.yaml
    
    log_info "Deploying Adminer (optional)..."
    kubectl apply -f k8s/adminer-deployment.yaml
    kubectl apply -f k8s/adminer-service.yaml
    kubectl apply -f k8s/adminer-ingress.yaml
    
    log_success "Deployment completed!"
    log_info "Use './k8s-scripts.sh status' to check the status"
}

# Deploy cert-manager issuer
deploy_cert_manager() {
    log_info "Deploying cert-manager ClusterIssuer..."
    kubectl apply -f k8s/cert-manager-issuer.yaml
    log_success "cert-manager ClusterIssuer deployed!"
}

# Show status of all resources
status() {
    log_info "Checking status of $APP_NAME resources..."
    
    echo -e "\n${BLUE}Namespace:${NC}"
    kubectl get namespace $NAMESPACE
    
    echo -e "\n${BLUE}Deployments:${NC}"
    kubectl get deployments -n $NAMESPACE
    
    echo -e "\n${BLUE}Services:${NC}"
    kubectl get services -n $NAMESPACE
    
    echo -e "\n${BLUE}Pods:${NC}"
    kubectl get pods -n $NAMESPACE
    
    echo -e "\n${BLUE}Ingress:${NC}"
    kubectl get ingress -n $NAMESPACE
    
    echo -e "\n${BLUE}PersistentVolumeClaims:${NC}"
    kubectl get pvc -n $NAMESPACE
    
    echo -e "\n${BLUE}ConfigMaps:${NC}"
    kubectl get configmaps -n $NAMESPACE
    
    echo -e "\n${BLUE}Secrets:${NC}"
    kubectl get secrets -n $NAMESPACE
}

# Show logs
logs() {
    local service=${2:-app}
    
    case $service in
        app|sveltekit)
            kubectl logs -f deployment/dot-env-app -n $NAMESPACE
            ;;
        mysql|db)
            kubectl logs -f deployment/mysql -n $NAMESPACE
            ;;
        nginx)
            kubectl logs -f deployment/nginx -n $NAMESPACE
            ;;
        adminer)
            kubectl logs -f deployment/adminer -n $NAMESPACE
            ;;
        *)
            log_error "Unknown service: $service"
            log_info "Available services: app, mysql, nginx, adminer"
            exit 1
            ;;
    esac
}

# Scale deployment
scale() {
    local service=${2:-app}
    local replicas=${3:-2}
    
    case $service in
        app|sveltekit)
            kubectl scale deployment/dot-env-app --replicas=$replicas -n $NAMESPACE
            ;;
        nginx)
            kubectl scale deployment/nginx --replicas=$replicas -n $NAMESPACE
            ;;
        *)
            log_error "Cannot scale service: $service"
            log_info "Scalable services: app, nginx"
            exit 1
            ;;
    esac
    
    log_success "Scaled $service to $replicas replicas"
}

# Restart deployment
restart() {
    local service=${2:-app}
    
    case $service in
        app|sveltekit)
            kubectl rollout restart deployment/dot-env-app -n $NAMESPACE
            ;;
        mysql|db)
            kubectl rollout restart deployment/mysql -n $NAMESPACE
            ;;
        nginx)
            kubectl rollout restart deployment/nginx -n $NAMESPACE
            ;;
        adminer)
            kubectl rollout restart deployment/adminer -n $NAMESPACE
            ;;
        all)
            kubectl rollout restart deployment/dot-env-app -n $NAMESPACE
            kubectl rollout restart deployment/mysql -n $NAMESPACE
            kubectl rollout restart deployment/nginx -n $NAMESPACE
            kubectl rollout restart deployment/adminer -n $NAMESPACE
            ;;
        *)
            log_error "Unknown service: $service"
            log_info "Available services: app, mysql, nginx, adminer, all"
            exit 1
            ;;
    esac
    
    log_success "Restarted $service"
}

# Delete all resources
delete() {
    log_warning "This will delete all resources in namespace $NAMESPACE"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deleting all resources..."
        kubectl delete namespace $NAMESPACE
        log_success "All resources deleted!"
    else
        log_info "Deletion cancelled"
    fi
}

# Build and push Docker image
build() {
    log_info "Building Docker image..."
    docker build -t $IMAGE_NAME:$IMAGE_TAG .
    
    if [ ! -z "$DOCKER_REGISTRY" ]; then
        log_info "Pushing to registry $DOCKER_REGISTRY..."
        docker tag $IMAGE_NAME:$IMAGE_TAG $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
        docker push $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
        log_success "Image pushed to registry!"
    else
        log_warning "DOCKER_REGISTRY not set. Image built locally only."
    fi
}

# Port forward for local access
port_forward() {
    local service=${2:-app}
    
    case $service in
        app|sveltekit)
            log_info "Port forwarding app service to localhost:3000..."
            kubectl port-forward service/app-service 3000:3000 -n $NAMESPACE
            ;;
        mysql|db)
            log_info "Port forwarding MySQL service to localhost:3306..."
            kubectl port-forward service/mysql-service 3306:3306 -n $NAMESPACE
            ;;
        adminer)
            log_info "Port forwarding Adminer service to localhost:8080..."
            kubectl port-forward service/adminer-service 8080:8080 -n $NAMESPACE
            ;;
        *)
            log_error "Unknown service: $service"
            log_info "Available services: app, mysql, adminer"
            exit 1
            ;;
    esac
}

# Show help
help() {
    echo "Kubernetes deployment scripts for $APP_NAME"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  deploy              Deploy all resources to Kubernetes"
    echo "  cert-manager        Deploy cert-manager ClusterIssuer"
    echo "  status              Show status of all resources"
    echo "  logs [service]      Show logs for a service (app, mysql, nginx, adminer)"
    echo "  scale [service] [n] Scale a service to n replicas"
    echo "  restart [service]   Restart a service (app, mysql, nginx, adminer, all)"
    echo "  delete              Delete all resources (with confirmation)"
    echo "  build               Build and optionally push Docker image"
    echo "  port-forward [svc]  Port forward a service for local access"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 logs app"
    echo "  $0 scale app 3"
    echo "  $0 restart nginx"
    echo "  $0 port-forward mysql"
    echo ""
    echo "Environment variables:"
    echo "  DOCKER_REGISTRY     Docker registry for pushing images"
}

# Main command handler
case ${1:-help} in
    deploy)
        deploy
        ;;
    cert-manager)
        deploy_cert_manager
        ;;
    status)
        status
        ;;
    logs)
        logs "$@"
        ;;
    scale)
        scale "$@"
        ;;
    restart)
        restart "$@"
        ;;
    delete)
        delete
        ;;
    build)
        build
        ;;
    port-forward)
        port_forward "$@"
        ;;
    help|--help|-h)
        help
        ;;
    *)
        log_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
