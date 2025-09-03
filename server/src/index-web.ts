#!/usr/bin/env node

// Load environment variables first
import * as dotenv from 'dotenv';
dotenv.config();

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
    // Check if running in HTTP mode (for deployment)
    if (process.env.PORT || process.env.HTTP_MODE) {
      this.startHttpServer();
    } else {
      // Default stdio mode for local MCP usage
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('CV & Email MCP Server running on stdio');
    }
  }

  private startHttpServer(): void {
    const port = process.env.PORT || 3000;
    
    const httpServer = http.createServer((req, res) => {
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
          }
        }, null, 2));
      } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
      } else if (req.method === 'GET' && req.url === '/tools') {
        const allTools = [...resumeTools, ...emailTools];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          tools: allTools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
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
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .tool { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
              .endpoint { background: #e3f2fd; padding: 10px; margin: 5px 0; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>🚀 CV Resume Email MCP Server</h1>
            <p>Model Context Protocol server for CV parsing and email notifications</p>
            
            <h2>📋 Available Tools</h2>
            <div class="tool">
              <h3>load_cv</h3>
              <p>Load and parse a PDF resume file</p>
            </div>
            <div class="tool">
              <h3>query_cv</h3>
              <p>Query information from loaded CV using natural language</p>
            </div>
            <div class="tool">
              <h3>send_email</h3>
              <p>Send email notifications with custom recipient, subject, and body</p>
            </div>
            <div class="tool">
              <h3>test_email_connection</h3>
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
            
            <h2>📖 Repository</h2>
            <p><a href="https://github.com/Dulshan201/cv-resume-email-mcp-server">GitHub Repository</a></p>
          </body>
          </html>
        `);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    httpServer.listen(port, () => {
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
