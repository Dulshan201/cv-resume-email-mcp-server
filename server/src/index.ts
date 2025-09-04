#!/usr/bin/env node

// Load environment variables first
import * as dotenv from 'dotenv';
const result = dotenv.config();
console.log('🔧 Dotenv result:', result);
console.log('🔧 All environment vars:', Object.keys(process.env).filter(k => k.includes('PORT') || k.includes('NODE_ENV') || k.includes('HTTP') || k.includes('RAILWAY')));

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { resumeTools } from './resume';
import { emailTools } from './email';
import * as http from 'http';

class MCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'cv-email-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    // Combine all tools
    const allTools = [...resumeTools, ...emailTools];

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: allTools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const tool = allTools.find(t => t.name === name);
        if (!tool) {
          throw new Error(`Unknown tool: ${name}`);
        }

        const result = await tool.handler(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    // Always start in HTTP mode for deployment
    // Check command line arguments first
    const httpMode = process.argv.includes('--http');
    
    // Check for deployment environment variables
    const isDeployment = !!(
      process.env.PORT || 
      process.env.RAILWAY_ENVIRONMENT || 
      process.env.HTTP_MODE ||
      process.env.NODE_ENV === 'production' ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID
    );
    
    console.log('🔍 Environment check:');
    console.log('  - PORT:', process.env.PORT);
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - HTTP_MODE:', process.env.HTTP_MODE);
    console.log('  - Command args:', process.argv.slice(2));
    console.log('  - Is deployment:', isDeployment);
    console.log('  - HTTP mode flag:', httpMode);
    
    // Force HTTP mode if any deployment indicators are present OR if explicitly requested
    const shouldUseHttp = isDeployment || httpMode;
    
    if (shouldUseHttp) {
      console.log('🚀 Starting HTTP server mode');
      this.startHttpServer();
    } else {
      // Default stdio mode for local MCP usage
      console.log('🔧 Starting stdio mode for local MCP usage');
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('CV & Email MCP Server running on stdio');
    }
  }

  private startHttpServer(): void {
    const port = process.env.PORT || 3000;
    
    const httpServer = http.createServer((req: any, res: any) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          name: 'CV Resume Email MCP Server',
          version: '1.0.0',
          status: 'running',
          tools: ['load_cv', 'query_cv', 'send_email', 'test_email_connection'],
          description: 'Model Context Protocol server for CV parsing and email notifications',
          endpoints: {
            health: '/health',
            tools: '/tools',
            docs: '/docs'
          },
          repository: 'https://github.com/Dulshan201/cv-resume-email-mcp-server'
        }, null, 2));
      } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          port: port
        }));
      } else if (req.method === 'GET' && req.url === '/tools') {
        const allTools = [...resumeTools, ...emailTools];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          tools: allTools.map(tool => ({
            name: tool.name,
            description: tool.description,
          })),
        }, null, 2));
      } else if (req.method === 'GET' && req.url === '/docs') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>CV Resume Email MCP Server</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
              .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .tool { background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #1976d2; }
              .endpoint { background: #f3e5f5; padding: 10px; margin: 5px 0; border-radius: 3px; }
              h1 { color: #1976d2; }
              h2 { color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 5px; }
              .success { color: #4caf50; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 CV Resume Email MCP Server</h1>
              <p class="success">✅ Server is running successfully!</p>
              <p>Model Context Protocol server for CV parsing and email notifications</p>
              
              <h2>📋 Available Tools</h2>
              <div class="tool">
                <h3>🔍 load_cv</h3>
                <p>Load and parse a PDF resume file for analysis</p>
              </div>
              <div class="tool">
                <h3>💬 query_cv</h3>
                <p>Query information from loaded CV using natural language</p>
              </div>
              <div class="tool">
                <h3>📧 send_email</h3>
                <p>Send email notifications with custom recipient, subject, and body</p>
              </div>
              <div class="tool">
                <h3>🔧 test_email_connection</h3>
                <p>Test email service configuration and connectivity</p>
              </div>

              <h2>🔗 API Endpoints</h2>
              <div class="endpoint">
                <strong>GET /</strong> - Server information and status
              </div>
              <div class="endpoint">
                <strong>GET /health</strong> - Health check endpoint  
              </div>
              <div class="endpoint">
                <strong>GET /tools</strong> - List all available MCP tools
              </div>
              <div class="endpoint">
                <strong>GET /docs</strong> - This documentation page
              </div>

              <h2>🔧 Usage</h2>
              <p>This server implements the Model Context Protocol (MCP) for AI assistants to interact with CV parsing and email capabilities.</p>
              <p>For local MCP usage, run the server without HTTP_MODE environment variable.</p>
              
              <h2>📖 Links</h2>
              <p>
                <a href="https://github.com/Dulshan201/cv-resume-email-mcp-server" target="_blank">📁 GitHub Repository</a><br>
                <a href="https://modelcontextprotocol.io/" target="_blank">📚 MCP Documentation</a>
              </p>
            </div>
          </body>
          </html>
        `);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found', path: req.url }));
      }
    });

    httpServer.listen(Number(port), () => {
      console.log(`🚀 CV & Email MCP Server running on port ${port}`);
      console.log(`📖 Documentation: http://localhost:${port}/docs`);
      console.log(`🔧 Tools API: http://localhost:${port}/tools`);
      console.log(`❤️  Health Check: http://localhost:${port}/health`);
    });
  }
}

// Start the server
async function main() {
  const server = new MCPServer();
  await server.run();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
