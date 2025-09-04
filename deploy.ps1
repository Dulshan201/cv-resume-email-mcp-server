# CV & Email MCP Server Deployment Script (PowerShell)
# Usage: .\deploy.ps1 [platform] [options]

param(
    [Parameter(Position=0)]
    [ValidateSet("local", "railway", "render", "heroku", "gcloud", "help")]
    [string]$Platform = "",
    
    [Parameter()]
    [string]$Port = "3001",
    
    [Parameter()]
    [string]$DockerFile = "Dockerfile.optimized",
    
    [Parameter()]
    [switch]$Help
)

$ImageName = "cv-email-mcp-server"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-ColorText "[INFO] $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorText "[SUCCESS] $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorText "[WARNING] $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorText "[ERROR] $Message" "Red"
}

function Show-Help {
    Write-ColorText "CV & Email MCP Server Deployment Script" "Blue"
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [PLATFORM] [OPTIONS]"
    Write-Host ""
    Write-Host "Platforms:"
    Write-Host "  local        Deploy locally with Docker"
    Write-Host "  railway      Deploy to Railway"
    Write-Host "  render       Deploy to Render"
    Write-Host "  heroku       Deploy to Heroku"
    Write-Host "  gcloud       Deploy to Google Cloud Run"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Port PORT          Local port (default: 3001)"
    Write-Host "  -DockerFile FILE    Dockerfile to use (default: Dockerfile.optimized)"
    Write-Host "  -Help              Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1 local                    # Deploy locally on port 3001"
    Write-Host "  .\deploy.ps1 local -Port 8080         # Deploy locally on port 8080"
    Write-Host "  .\deploy.ps1 railway                  # Deploy to Railway"
    Write-Host "  .\deploy.ps1 gcloud                   # Deploy to Google Cloud Run"
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Start-LocalDeployment {
    Write-Info "Deploying locally with Docker..."
    
    if (-not (Test-Command "docker")) {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }
    
    Write-Info "Building Docker image..."
    docker build -f $DockerFile -t $ImageName .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed"
        exit 1
    }
    
    Write-Info "Starting container on port $Port..."
    docker run -d -p "${Port}:3000" --name $ImageName $ImageName
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Container might already be running. Stopping and restarting..."
        docker stop $ImageName 2>$null
        docker rm $ImageName 2>$null
        docker run -d -p "${Port}:3000" --name $ImageName $ImageName
    }
    
    Write-Success "Server deployed locally!"
    Write-Info "Access your application at: http://localhost:$Port"
    Write-Info "Health check: http://localhost:$Port/health"
    Write-Info "To stop: docker stop $ImageName"
}

function Start-RailwayDeployment {
    Write-Info "Deploying to Railway..."
    
    if (-not (Test-Command "railway")) {
        Write-Error "Railway CLI is not installed. Install from: https://railway.app"
        Write-Info "Alternative: Push to GitHub and deploy via Railway web interface"
        exit 1
    }
    
    Write-Info "Logging in to Railway..."
    railway login
    
    Write-Info "Deploying to Railway..."
    railway up
    
    Write-Success "Deployment to Railway initiated!"
    Write-Info "Check deployment status: railway status"
    Write-Info "View logs: railway logs"
}

function Start-RenderDeployment {
    Write-Info "Deploying to Render..."
    Write-Info "Render deployment requires web interface or render.yaml in repository"
    Write-Info "1. Push your code to GitHub"
    Write-Info "2. Visit https://render.com"
    Write-Info "3. Connect repository and deploy"
    Write-Info "render.yaml configuration file is ready in your repository"
    Write-Success "Render deployment instructions provided"
}

function Start-HerokuDeployment {
    Write-Info "Deploying to Heroku..."
    
    if (-not (Test-Command "heroku")) {
        Write-Error "Heroku CLI is not installed. Install from: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    }
    
    Write-Info "Logging in to Heroku..."
    heroku login
    
    Write-Info "Creating Heroku app (if not exists)..."
    $appName = Read-Host "Enter Heroku app name (or press Enter for auto-generated)"
    if ($appName) {
        heroku create $appName
    } else {
        heroku create
    }
    
    Write-Info "Setting container stack..."
    heroku stack:set container
    
    Write-Info "Deploying to Heroku..."
    git push heroku main
    
    Write-Success "Deployment to Heroku initiated!"
    Write-Info "View app: heroku open"
    Write-Info "View logs: heroku logs --tail"
}

function Start-GCloudDeployment {
    Write-Info "Deploying to Google Cloud Run..."
    
    if (-not (Test-Command "gcloud")) {
        Write-Error "Google Cloud CLI is not installed. Install from: https://cloud.google.com/sdk"
        exit 1
    }
    
    Write-Info "Authenticating with Google Cloud..."
    gcloud auth login
    
    $projectId = Read-Host "Enter Google Cloud Project ID"
    if (-not $projectId) {
        Write-Error "Project ID is required"
        exit 1
    }
    
    Write-Info "Setting project..."
    gcloud config set project $projectId
    
    Write-Info "Building and deploying to Cloud Run..."
    gcloud run deploy cv-email-mcp-server `
        --source . `
        --platform managed `
        --region us-central1 `
        --allow-unauthenticated `
        --port 3000
    
    Write-Success "Deployment to Google Cloud Run initiated!"
    Write-Info "View service: gcloud run services list"
}

# Main execution
if ($Help -or $Platform -eq "help" -or $Platform -eq "") {
    Show-Help
    exit 0
}

Write-Info "CV & Email MCP Server Deployment Starting..."
Write-Info "Platform: $Platform"
Write-Info "Docker File: $DockerFile"

switch ($Platform) {
    "local" { Start-LocalDeployment }
    "railway" { Start-RailwayDeployment }
    "render" { Start-RenderDeployment }
    "heroku" { Start-HerokuDeployment }
    "gcloud" { Start-GCloudDeployment }
    default {
        Write-Error "Unknown platform: $Platform"
        Show-Help
        exit 1
    }
}

Write-Success "Deployment script completed!"
