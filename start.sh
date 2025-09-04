#!/bin/bash
echo "🚀 Starting CV & Email MCP Server..."
cd server
echo "📦 Installing dependencies..."
npm install
echo "🔨 Building application..."
npm run build
echo "🌟 Starting server..."
NODE_ENV=production npm start
