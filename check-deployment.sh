#!/bin/bash

# CV & Email MCP Server - Deployment Status Checker
# Usage: ./check-deployment.sh [url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_help() {
    echo -e "${BLUE}CV & Email MCP Server - Deployment Status Checker${NC}"
    echo ""
    echo "Usage: $0 [URL]"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Check localhost:3001"
    echo "  $0 http://localhost:8080             # Check custom local URL"
    echo "  $0 https://your-app.railway.app      # Check Railway deployment"
    echo "  $0 https://your-app.onrender.com     # Check Render deployment"
}

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

check_health() {
    local url=$1
    local health_url="${url}/health"
    
    log_info "Checking health endpoint: $health_url"
    
    # Check if the health endpoint is accessible
    if curl -s --fail --max-time 10 "$health_url" > /dev/null; then
        log_success "Health endpoint is responding"
        
        # Get the response content
        local response=$(curl -s --max-time 10 "$health_url")
        echo "Health Response: $response"
        return 0
    else
        log_error "Health endpoint is not responding"
        return 1
    fi
}

check_main_endpoint() {
    local url=$1
    
    log_info "Checking main endpoint: $url"
    
    # Check if the main endpoint is accessible
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
    
    if [ "$status_code" = "200" ]; then
        log_success "Main endpoint is responding (HTTP $status_code)"
        return 0
    else
        log_warning "Main endpoint returned HTTP $status_code"
        return 1
    fi
}

check_docker_container() {
    log_info "Checking local Docker container..."
    
    if command -v docker > /dev/null 2>&1; then
        local container_status=$(docker ps --filter "name=cv-email-mcp-server" --format "{{.Status}}" 2>/dev/null)
        
        if [ -n "$container_status" ]; then
            log_success "Docker container is running: $container_status"
            
            # Show container logs (last 10 lines)
            log_info "Recent container logs:"
            docker logs --tail 10 cv-email-mcp-server 2>/dev/null || log_warning "Could not retrieve logs"
        else
            log_warning "Docker container 'cv-email-mcp-server' is not running"
        fi
    else
        log_warning "Docker is not installed or not in PATH"
    fi
}

# Main execution
URL=${1:-"http://localhost:3001"}

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    print_help
    exit 0
fi

echo -e "${BLUE}=== CV & Email MCP Server Deployment Status ===${NC}"
echo "Checking URL: $URL"
echo ""

# Check if URL is localhost, then also check Docker
if [[ "$URL" == *"localhost"* ]] || [[ "$URL" == *"127.0.0.1"* ]]; then
    check_docker_container
    echo ""
fi

# Check main endpoint
check_main_endpoint "$URL"
echo ""

# Check health endpoint
check_health "$URL"
echo ""

# Additional checks for cloud deployments
if [[ "$URL" == *"railway.app"* ]]; then
    log_info "Railway deployment detected"
    log_info "Check deployment logs: railway logs"
    log_info "Check deployment status: railway status"
elif [[ "$URL" == *"onrender.com"* ]]; then
    log_info "Render deployment detected"
    log_info "Check deployment in Render dashboard"
elif [[ "$URL" == *"herokuapp.com"* ]]; then
    log_info "Heroku deployment detected"
    log_info "Check deployment logs: heroku logs --tail"
    log_info "Check deployment status: heroku ps"
elif [[ "$URL" == *"run.app"* ]]; then
    log_info "Google Cloud Run deployment detected"
    log_info "Check deployment: gcloud run services list"
fi

echo ""
log_info "Deployment check completed!"
