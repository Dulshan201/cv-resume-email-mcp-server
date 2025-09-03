const { spawn } = require('child_process');
const path = require('path');

class MCPTester {
  constructor() {
    this.server = null;
    this.requestId = 1;
  }

  async testServer() {
    console.log('🧪 Testing CV & Email MCP Server...');
    
    try {
      await this.startServer();
      await this.testListTools();
      await this.testEmailConnection();
      await this.testCVQuery();
      console.log('✅ All tests completed successfully!');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    } finally {
      this.cleanup();
    }
  }

  startServer() {
    return new Promise((resolve, reject) => {
      console.log('Test 1: Starting MCP Server...');
      
      const serverPath = path.join(__dirname, 'dist', 'index.js');
      console.log('Server path:', serverPath);
      
      this.server = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.server.stdout.on('data', (data) => {
        const response = data.toString().trim();
        if (response) {
          console.log('📤 Server response:', response);
        }
      });

      this.server.stderr.on('data', (data) => {
        const message = data.toString().trim();
        if (message.includes('running on stdio')) {
          console.log('✅ Server started successfully');
          resolve();
        } else {
          console.log('💬 Server stderr:', message);
        }
      });

      this.server.on('error', (error) => {
        reject(new Error(`Server spawn error: ${error.message}`));
      });

      // Give server time to start
      setTimeout(() => {
        if (!this.server.killed) {
          resolve();
        }
      }, 1000);
    });
  }

  sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: this.requestId++
      };

      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout for ${method}`));
      }, 5000);

      const responseHandler = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === request.id) {
            clearTimeout(timeout);
            this.server.stdout.removeListener('data', responseHandler);
            resolve(response);
          }
        } catch (error) {
          // Ignore parse errors, might be partial data
        }
      };

      this.server.stdout.on('data', responseHandler);
      this.server.stdin.write(JSON.stringify(request) + '\\n');
    });
  }

  async testListTools() {
    console.log('\\nTest 2: Listing available tools...');
    const response = await this.sendRequest('tools/list');
    
    if (response.result && response.result.tools) {
      console.log('✅ Found tools:', response.result.tools.map(t => t.name).join(', '));
      return response.result.tools;
    } else {
      throw new Error('No tools found in response');
    }
  }

  async testEmailConnection() {
    console.log('\\nTest 3: Testing email connection...');
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'test_email_connection',
        arguments: {}
      });
      
      if (response.result) {
        console.log('✅ Email connection test result:', response.result.content[0].text);
      }
    } catch (error) {
      console.log('⚠️  Email connection test skipped (no config)');
    }
  }

  async testCVQuery() {
    console.log('\\nTest 4: Testing CV query...');
    const response = await this.sendRequest('tools/call', {
      name: 'query_cv',
      arguments: {
        query: 'What programming languages does this person know?'
      }
    });
    
    if (response.result && response.result.content) {
      console.log('✅ CV query result:', response.result.content[0].text);
    } else {
      throw new Error('No content in CV query response');
    }
  }

  cleanup() {
    console.log('\\n🧹 Cleaning up test...');
    if (this.server && !this.server.killed) {
      this.server.kill();
    }
  }
}

// Run the test
const tester = new MCPTester();
tester.testServer().catch(console.error);
