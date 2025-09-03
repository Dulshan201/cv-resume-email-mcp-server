#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { cvQueryTool, loadCVTool } from './tools/cvParser.js';
import { sendEmailTool, testEmailTool } from './tools/emailService.js';

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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: loadCVTool.name,
            description: loadCVTool.description,
            inputSchema: loadCVTool.inputSchema,
          },
          {
            name: cvQueryTool.name,
            description: cvQueryTool.description,
            inputSchema: cvQueryTool.inputSchema,
          },
          {
            name: sendEmailTool.name,
            description: sendEmailTool.description,
            inputSchema: sendEmailTool.inputSchema,
          },
          {
            name: testEmailTool.name,
            description: testEmailTool.description,
            inputSchema: testEmailTool.inputSchema,
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case loadCVTool.name:
            const loadResult = await loadCVTool.handler(args as any);
            return {
              content: [
                {
                  type: 'text',
                  text: loadResult,
                },
              ],
            };

          case cvQueryTool.name:
            const queryResult = await cvQueryTool.handler(args as any);
            return {
              content: [
                {
                  type: 'text',
                  text: queryResult,
                },
              ],
            };

          case sendEmailTool.name:
            const emailResult = await sendEmailTool.handler(args as any);
            return {
              content: [
                {
                  type: 'text',
                  text: emailResult,
                },
              ],
            };

          case testEmailTool.name:
            const testResult = await testEmailTool.handler(args as any);
            return {
              content: [
                {
                  type: 'text',
                  text: testResult,
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
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
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('CV & Email MCP Server running on stdio');
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
