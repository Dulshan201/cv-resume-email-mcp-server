# CV & Email MCP Server - Quick Start Guide

## 🚀 Quick Deploy

This project is ready for deployment on multiple cloud platforms with Docker. All configuration files are included.

### ✅ What's Ready

- **Docker**: Optimized production Dockerfile with security best practices
- **Docker Compose**: Local development with optional nginx proxy
- **Cloud Configs**: Railway, Render, Heroku, Google Cloud Run
- **CI/CD**: GitHub Actions workflow with security scanning
- **Documentation**: Complete deployment guide in `DEPLOYMENT.md`

### 🏃 Quick Start (30 seconds)

#### Local with Docker
```bash
docker build -f Dockerfile.optimized -t cv-email-mcp-server .
docker run -p 3001:3000 cv-email-mcp-server
```
Visit: http://localhost:3001

#### Cloud Deploy (Railway - Recommended)
1. Push to GitHub
2. Visit [Railway.app](https://railway.app)
3. Import repository → Deploy!
4. Your app will be live in ~2 minutes

### 📁 Key Files

- `Dockerfile.optimized` - Production-ready Docker image
- `docker-compose.yml` - Local development stack
- `railway.toml` - Railway configuration
- `render.yaml` - Render configuration
- `Procfile` - Heroku configuration
- `cloud-run.yaml` - Google Cloud Run
- `DEPLOYMENT.md` - Complete deployment guide
- `.github/workflows/ci-cd.yml` - CI/CD pipeline

### 🛠️ Development

```bash
npm install
npm run dev  # Development server
npm run build  # Build for production
npm start  # Production server
```

### 📚 Full Documentation

- **Deployment Guide**: See `DEPLOYMENT.md` for detailed platform instructions
- **API Documentation**: Check the playground at `/playground` when running
- **Contributing**: See `CONTRIBUTING.md`

### 🔧 Environment Variables

Create `.env` from `.env.example` and configure:
- Email settings for notifications
- Any API keys needed

### 🌟 Features

- **CV/Resume Parsing**: PDF resume analysis
- **Email Notifications**: Send emails via MCP tools
- **Health Checks**: `/health` endpoint for monitoring
- **Security**: Non-root Docker user, dependency scanning
- **Performance**: Multi-stage builds, optimized images

**Ready to deploy? Choose your platform and follow the guides!** 🚀
