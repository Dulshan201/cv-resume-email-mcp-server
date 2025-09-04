# 🚀 Deployment Guide for CV & Email MCP Server

This guide covers multiple deployment options using Docker for your CV & Email MCP Server.

## 📋 Prerequisites

- Docker installed locally
- Git repository with your code
- Account on your chosen cloud platform

## 🏗️ Building the Docker Image

### Local Build
```bash
# Standard build
docker build -t cv-email-mcp-server .

# Optimized production build (recommended)
docker build -f Dockerfile.optimized -t cv-email-mcp-server .

# Test locally
docker run -p 3001:3000 cv-email-mcp-server
```

### Docker Compose (Local Development)
```bash
# Start the application
docker-compose up -d

# With nginx proxy
docker-compose --profile proxy up -d

# Stop the application
docker-compose down
```

## ☁️ Cloud Deployment Options

### 1. Railway (Recommended - Free Tier Available)

Railway offers excellent Docker support with automatic deployments.

#### Setup:
1. Visit [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect the `railway.toml` file
4. Deploy with one click!

#### Configuration:
The `railway.toml` file is already configured:
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/health"
```

#### Custom Domain:
- Railway provides a free subdomain: `yourapp.up.railway.app`
- You can also configure custom domains in the Railway dashboard

---

### 2. Render (Free Tier Available)

Render provides excellent Docker support with automatic SSL.

#### Setup:
1. Visit [Render.com](https://render.com)
2. Connect your repository
3. Create a new "Web Service"
4. Choose "Docker" as runtime
5. Deploy!

#### Configuration:
The `render.yaml` file is pre-configured for you.

#### Features:
- Free SSL certificates
- Custom domains
- Automatic deployments
- Health checks

---

### 3. Google Cloud Run (Pay-as-you-go)

Serverless container platform with excellent scaling.

#### Setup:
```bash
# 1. Install Google Cloud CLI
# 2. Authenticate
gcloud auth login

# 3. Set project
gcloud config set project YOUR_PROJECT_ID

# 4. Build and push to Google Container Registry
docker build -t gcr.io/YOUR_PROJECT_ID/cv-email-mcp-server .
docker push gcr.io/YOUR_PROJECT_ID/cv-email-mcp-server

# 5. Deploy to Cloud Run
gcloud run deploy cv-email-mcp-server \
  --image gcr.io/YOUR_PROJECT_ID/cv-email-mcp-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

#### Alternative with YAML:
```bash
gcloud run services replace cloud-run.yaml
```

---

### 4. Heroku

Classic platform with excellent addon ecosystem.

#### Setup:
```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create your-app-name

# 4. Set stack to container
heroku stack:set container -a your-app-name

# 5. Deploy
git push heroku main
```

#### One-Click Deploy:
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

---

### 5. DigitalOcean App Platform

Simple deployment with automatic scaling.

#### Setup:
1. Visit [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Connect your repository
3. Choose "Docker Hub" or "Source Code"
4. Configure:
   - Runtime: Docker
   - Dockerfile path: `Dockerfile`
   - Port: 3000
5. Deploy!

---

### 6. AWS App Runner

Serverless application service from AWS.

#### Setup:
```bash
# 1. Push to ECR
aws ecr create-repository --repository-name cv-email-mcp-server
docker tag cv-email-mcp-server:latest AWS_ACCOUNT.dkr.ecr.region.amazonaws.com/cv-email-mcp-server:latest
docker push AWS_ACCOUNT.dkr.ecr.region.amazonaws.com/cv-email-mcp-server:latest

# 2. Create App Runner service via AWS Console or CLI
aws apprunner create-service --cli-input-json file://apprunner-service.json
```

---

## 🔧 Configuration

### Environment Variables
All platforms support these environment variables:
- `NODE_ENV=production`
- `PORT=3000` (usually auto-set by platform)

### Health Checks
All deployments include health checks at `/health` endpoint.

### SSL/HTTPS
Most platforms provide automatic SSL certificates.

## 📊 Monitoring & Logging

### Health Check Endpoint
```
GET /health
```
Returns: `{ "status": "ok", "timestamp": "..." }`

### API Documentation
```
GET /docs
```
Interactive API documentation

### Tools Endpoint
```
GET /tools
```
Available MCP tools

## 🔒 Security Best Practices

1. **Non-root User**: Docker images run as non-root user
2. **Health Checks**: Built-in health monitoring
3. **Environment Variables**: Secure configuration
4. **HTTPS**: All platforms provide SSL
5. **Resource Limits**: Memory and CPU limits configured

## 💰 Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Railway | ✅ 500hrs/month | $5/month | Small projects |
| Render | ✅ 750hrs/month | $7/month | Web applications |
| Google Cloud Run | ✅ 2M requests | Pay-per-use | Serverless |
| Heroku | ✅ 550-1000 dyno hours | $7/month | Traditional apps |
| DigitalOcean | ❌ | $5/month | Scalable apps |

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Docker syntax
   - Verify all files are included
   - Check build logs

2. **Health Check Fails**
   - Verify `/health` endpoint works locally
   - Check port configuration
   - Review startup logs

3. **Memory Issues**
   - Increase memory limits
   - Optimize Docker image size
   - Check for memory leaks

### Getting Help:
- Check platform-specific logs
- Review health check status
- Monitor resource usage
- Test locally first

## 🎉 Quick Start Commands

### Railway:
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

### Render:
```bash
# Just push to GitHub - automatic deployment
git push origin main
```

### Google Cloud Run:
```bash
gcloud run deploy --source .
```

### Heroku:
```bash
git push heroku main
```

Choose the platform that best fits your needs and budget. Railway and Render are great for getting started quickly with free tiers!
