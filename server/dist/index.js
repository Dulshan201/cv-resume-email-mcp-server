#!/usr/bin/env node

console.log('🚀 Starting CV & Email MCP Server...');
console.log(`   - Node.js version: ${process.version}`);
console.log(`   - Platform: ${process.platform}`);
console.log(`   - Architecture: ${process.arch}`);

const http = require('http');

// Configuration
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

console.log(`🌐 Server configuration:`);
console.log(`   - Host: ${host}`);
console.log(`   - Port: ${port}`);

// Create HTTP server
const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`📞 ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    }));
    return;
  }
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'CV & Email MCP Server is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        root: '/'
      }
    }));
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not found',
    path: req.url
  }));
});

// Error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Start server
server.listen(port, host, () => {
  console.log(`✅ HTTP server running at http://${host}:${port}`);
  console.log(`✅ Health endpoint: http://${host}:${port}/health`);
  console.log('📋 Server is ready to accept connections');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});
