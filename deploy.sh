#!/bin/bash

# CV & Email MCP Server Deployment Script
# Usage: ./deploy.sh [platform] [options]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PLATFORM=""
IMAGE_NAME="cv-email-mcp-server"
PORT="3001"
DOCKERFILE="Dockerfile"

print_help() {
    echo -e "${BLUE}CV & Email MCP Server Deployment Script${NC}"
    echo ""
    echo "Usage: $0 [PLATFORM] [OPTIONS]"
    echo ""
    echo "Platforms:"
    echo "  local        Deploy locally with Docker"
    echo "  railway      Deploy to Railway"
    echo "  render       Deploy to Render"
    echo "  heroku       Deploy to Heroku"
    echo "  gcloud       Deploy to Google Cloud Run"
    echo ""
    echo "Options:"
    echo "  -p, --port PORT     Local port (default: 3001)"
    echo "  -f, --file FILE     Dockerfile to use (default: Dockerfile)"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local                    # Deploy locally on port 3001"
    echo "  $0 local -p 8080           # Deploy locally on port 8080"
    echo "  $0 railway                 # Deploy to Railway"
    echo "  $0 gcloud                  # Deploy to Google Cloud Run"
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

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
}

build_image() {
    log_info "Building Docker image..."
    docker build -f "$DOCKERFILE" -t "$IMAGE_NAME" .
    log_success "Docker image built successfully"
}

deploy_local() {
    log_info "Deploying locally on port $PORT..."
    
    # Stop existing container if running
    if docker ps -q -f name="$IMAGE_NAME" | grep -q .; then
        log_info "Stopping existing container..."
        docker stop "$IMAGE_NAME" || true
        docker rm "$IMAGE_NAME" || true
    fi
    
    # Run new container
    docker run -d \
        --name "$IMAGE_NAME" \
        -p "$PORT:3000" \
        --restart unless-stopped \
        "$IMAGE_NAME"
    
    log_success "Container started successfully!"
    log_info "Application is running at: http://localhost:$PORT"
    log_info "Health check: http://localhost:$PORT/health"
    log_info "API docs: http://localhost:$PORT/docs"
    log_info ""
    log_info "To view logs: docker logs -f $IMAGE_NAME"
    log_info "To stop: docker stop $IMAGE_NAME"
}

deploy_railway() {
    log_info "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI not found. Install it with: npm install -g @railway/cli"
        exit 1
    fi
    
    railway up
    log_success "Deployed to Railway successfully!"
}

deploy_render() {
    log_info "Deploying to Render..."
    log_info "Please ensure your repository is connected to Render and push your changes:"
    log_info "git push origin main"
    log_warning "Render deploys automatically from your connected repository"
}

deploy_heroku() {
    log_info "Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        log_error "Heroku CLI not found. Install it from: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        log_error "Not in a git repository. Initialize git first: git init"
        exit 1
    fi
    
    # Check if heroku remote exists
    if ! git remote get-url heroku &> /dev/null; then
        log_warning "Heroku remote not found. Create your app first: heroku create your-app-name"
        log_warning "Or add remote: heroku git:remote -a your-app-name"
        exit 1
    fi
    
    git push heroku main
    log_success "Deployed to Heroku successfully!"
}

deploy_gcloud() {
    log_info "Deploying to Google Cloud Run..."
    
    if ! command -v gcloud &> /dev/null; then
        log_error "Google Cloud CLI not found. Install it from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "Not authenticated with Google Cloud. Run: gcloud auth login"
        exit 1
    fi
    
    # Get current project
    PROJECT_ID=$(gcloud config get-value project)
    if [ -z "$PROJECT_ID" ]; then
        log_error "No project set. Run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    log_info "Using project: $PROJECT_ID"
    
    # Build and deploy
    gcloud run deploy cv-email-mcp-server \
        --source . \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --port 3000 \
        --memory 512Mi \
        --timeout 300
    
    log_success "Deployed to Google Cloud Run successfully!"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        local|railway|render|heroku|gcloud)
            PLATFORM="$1"
            shift
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -f|--file)
            DOCKERFILE="$2"
            shift 2
            ;;
        -h|--help)
            print_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            print_help
            exit 1
            ;;
    esac
done

# Main execution
if [ -z "$PLATFORM" ]; then
    log_error "Platform not specified"
    print_help
    exit 1
fi

log_info "Starting deployment to: $PLATFORM"

case $PLATFORM in
    local)
        check_docker
        build_image
        deploy_local
        ;;
    railway)
        deploy_railway
        ;;
    render)
        deploy_render
        ;;
    heroku)
        deploy_heroku
        ;;
    gcloud)
        check_docker
        deploy_gcloud
        ;;
    *)
        log_error "Unknown platform: $PLATFORM"
        print_help
        exit 1
        ;;
esac

log_success "Deployment completed!"
