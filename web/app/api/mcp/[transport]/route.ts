import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// This is a simplified MCP adapter for Vercel-style API routes
// In a real implementation, you'd want a more robust MCP client

interface MCPRequest {
  method: string;
  params: any;
}

interface MCPResponse {
  result?: any;
  error?: string;
}

class MCPClient {
  private serverPath: string;

  constructor() {
    // Assuming the server is built and available
    this.serverPath = path.join(process.cwd(), '..', 'server', 'dist', 'index.js');
  }

  async callTool(toolName: string, args: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            // Parse the MCP response
            // This is a simplified version - real MCP protocol is more complex
            resolve(output.trim());
          } catch (error) {
            reject(new Error('Failed to parse MCP response'));
          }
        } else {
          reject(new Error(`MCP server exited with code ${code}: ${errorOutput}`));
        }
      });

      // Send MCP request
      const request: MCPRequest = {
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      child.stdin.write(JSON.stringify(request) + '\n');
      child.stdin.end();
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { transport: string } }
) {
  const { transport } = params;
  
  try {
    const body = await request.json();
    const client = new MCPClient();

    let result: any;

    switch (transport) {
      case 'load-cv':
        // Handle file upload and CV loading
        const { filePath } = body;
        if (!filePath) {
          return NextResponse.json({ error: 'File path required' }, { status: 400 });
        }
        result = await client.callTool('load_cv', { filePath });
        break;

      case 'query-cv':
        // Handle CV queries
        const { question } = body;
        if (!question) {
          return NextResponse.json({ error: 'Question required' }, { status: 400 });
        }
        result = await client.callTool('query_cv', { question });
        break;

      case 'send-email':
        // Handle email sending
        const { recipient, subject, body: emailBody } = body;
        if (!recipient || !subject || !emailBody) {
          return NextResponse.json({ error: 'Recipient, subject, and body required' }, { status: 400 });
        }
        result = await client.callTool('send_email', { recipient, subject, body: emailBody });
        break;

      case 'test-email':
        // Handle email connection testing
        result = await client.callTool('test_email_connection', {});
        break;

      default:
        return NextResponse.json({ error: 'Unknown transport' }, { status: 400 });
    }

    return NextResponse.json({ message: result });
  } catch (error) {
    console.error('MCP API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
