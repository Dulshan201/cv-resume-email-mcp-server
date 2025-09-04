# CV & Email MCP Server - Deployment Status Checker (PowerShell)
# Usage: .\check-deployment.ps1 [url]

param(
    [Parameter(Position=0)]
    [string]$Url = "http://localhost:3001",
    
    [Parameter()]
    [switch]$Help
)

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
    Write-ColorText "CV & Email MCP Server - Deployment Status Checker" "Blue"
    Write-Host ""
    Write-Host "Usage: .\check-deployment.ps1 [URL]"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\check-deployment.ps1                                    # Check localhost:3001"
    Write-Host "  .\check-deployment.ps1 http://localhost:8080             # Check custom local URL"
    Write-Host "  .\check-deployment.ps1 https://your-app.railway.app      # Check Railway deployment"
    Write-Host "  .\check-deployment.ps1 https://your-app.onrender.com     # Check Render deployment"
}

function Test-HealthEndpoint {
    param([string]$BaseUrl)
    
    $healthUrl = "$BaseUrl/health"
    Write-Info "Checking health endpoint: $healthUrl"
    
    try {
        $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 10 -ErrorAction Stop
        Write-Success "Health endpoint is responding"
        Write-Host "Health Response: $($response | ConvertTo-Json -Compress)"
        return $true
    }
    catch {
        Write-Error "Health endpoint is not responding: $($_.Exception.Message)"
        return $false
    }
}

function Test-MainEndpoint {
    param([string]$BaseUrl)
    
    Write-Info "Checking main endpoint: $BaseUrl"
    
    try {
        $response = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 10 -ErrorAction Stop
        Write-Success "Main endpoint is responding (HTTP $($response.StatusCode))"
        return $true
    }
    catch {
        Write-Warning "Main endpoint error: $($_.Exception.Message)"
        return $false
    }
}

function Test-DockerContainer {
    Write-Info "Checking local Docker container..."
    
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        try {
            $containers = docker ps --filter "name=cv-email-mcp-server" --format "{{.Status}}" 2>$null
            
            if ($containers) {
                Write-Success "Docker container is running: $containers"
                
                Write-Info "Recent container logs:"
                $logs = docker logs --tail 10 cv-email-mcp-server 2>$null
                if ($logs) {
                    Write-Host $logs
                } else {
                    Write-Warning "Could not retrieve logs"
                }
            } else {
                Write-Warning "Docker container 'cv-email-mcp-server' is not running"
            }
        }
        catch {
            Write-Warning "Error checking Docker container: $($_.Exception.Message)"
        }
    } else {
        Write-Warning "Docker is not installed or not in PATH"
    }
}

function Show-PlatformInfo {
    param([string]$Url)
    
    if ($Url -match "railway\.app") {
        Write-Info "Railway deployment detected"
        Write-Info "Check deployment logs: railway logs"
        Write-Info "Check deployment status: railway status"
    }
    elseif ($Url -match "onrender\.com") {
        Write-Info "Render deployment detected"
        Write-Info "Check deployment in Render dashboard"
    }
    elseif ($Url -match "herokuapp\.com") {
        Write-Info "Heroku deployment detected"
        Write-Info "Check deployment logs: heroku logs --tail"
        Write-Info "Check deployment status: heroku ps"
    }
    elseif ($Url -match "run\.app") {
        Write-Info "Google Cloud Run deployment detected"
        Write-Info "Check deployment: gcloud run services list"
    }
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Write-ColorText "=== CV & Email MCP Server Deployment Status ===" "Blue"
Write-Host "Checking URL: $Url"
Write-Host ""

# Check if URL is localhost, then also check Docker
if ($Url -match "localhost|127\.0\.0\.1") {
    Test-DockerContainer
    Write-Host ""
}

# Check main endpoint
Test-MainEndpoint -BaseUrl $Url
Write-Host ""

# Check health endpoint
Test-HealthEndpoint -BaseUrl $Url
Write-Host ""

# Show platform-specific information
Show-PlatformInfo -Url $Url
Write-Host ""

Write-Info "Deployment check completed!"
