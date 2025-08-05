#!/bin/bash

# Docker management scripts for dot-env project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if Docker and Docker Compose are installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Setup environment file
setup_env() {
    print_header "Setting up environment file"
    
    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            cp .env.docker .env
            print_status "Created .env file from .env.docker template"
            print_warning "Please update .env file with your actual values before running the application"
        else
            print_error ".env.docker template not found"
            exit 1
        fi
    else
        print_status ".env file already exists"
    fi
}

# Build and start services
start_services() {
    print_header "Starting Docker services"
    
    check_docker
    setup_env
    
    print_status "Building and starting services..."
    docker-compose up --build -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Services started successfully!"
        print_status "Application: http://localhost:3000"
        print_status "Database Admin (Adminer): http://localhost:8080"
        print_status "Database connection: localhost:3306"
    else
        print_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Stop services
stop_services() {
    print_header "Stopping Docker services"
    
    docker-compose down
    print_status "Services stopped"
}

# Restart services
restart_services() {
    print_header "Restarting Docker services"
    
    stop_services
    start_services
}

# View logs
view_logs() {
    print_header "Viewing Docker logs"
    
    if [ -n "$1" ]; then
        docker-compose logs -f "$1"
    else
        docker-compose logs -f
    fi
}

# Run database migrations
run_migrations() {
    print_header "Running database migrations"
    
    # Check if app container is running
    if ! docker-compose ps app | grep -q "Up"; then
        print_error "App container is not running. Start services first."
        exit 1
    fi
    
    print_status "Running Drizzle migrations..."
    docker-compose exec app npm run db:migrate
    print_status "Migrations completed"
}

# Open database studio
db_studio() {
    print_header "Opening Drizzle Studio"
    
    if ! docker-compose ps app | grep -q "Up"; then
        print_error "App container is not running. Start services first."
        exit 1
    fi
    
    print_status "Starting Drizzle Studio..."
    docker-compose exec app npm run db:studio
}

# Clean up everything (including volumes)
cleanup() {
    print_header "Cleaning up Docker resources"
    
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_status "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Show help
show_help() {
    echo "Docker management script for dot-env project"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Build and start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs [service]  View logs (optionally for specific service)"
    echo "  migrate     Run database migrations"
    echo "  studio      Open Drizzle Studio"
    echo "  cleanup     Remove all containers, networks, and volumes"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs app"
    echo "  $0 migrate"
}

# Main script logic
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        view_logs "$2"
        ;;
    migrate)
        run_migrations
        ;;
    studio)
        db_studio
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
