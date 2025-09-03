const { spawn } = require('child_process');
const path = require('path');

async function testMCPProtocol() {
  console.log('🔧 Testing MCP Protocol Implementation...');
  
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let requestId = 1;

  // Helper function to send request and wait for response
  function sendMCPRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: requestId++
      };

      console.log(`📤 Sending: ${method}`);
      
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${method} response`));
      }, 5000);

      const handleResponse = (data) => {
        const response = data.toString().trim();
        if (response) {
          try {
            const parsed = JSON.parse(response);
            if (parsed.id === request.id) {
              clearTimeout(timeout);
              server.stdout.removeListener('data', handleResponse);
              resolve(parsed);
            }
          } catch (e) {
            // Could be partial JSON, continue listening
          }
        }
      };

      server.stdout.on('data', handleResponse);
      server.stdin.write(JSON.stringify(request) + '\\n');
    });
  }

  try {
    // Wait for server to start
    await new Promise(resolve => {
      server.stderr.on('data', (data) => {
        if (data.toString().includes('running on stdio')) {
          console.log('✅ Server started');
          resolve();
        }
      });
      setTimeout(resolve, 1000);
    });

    // Test 1: List tools
    console.log('\\n1️⃣ Testing tools/list...');
    const toolsResponse = await sendMCPRequest('tools/list');
    if (toolsResponse.result && toolsResponse.result.tools) {
      console.log('✅ Tools available:');
      toolsResponse.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    }

    // Test 2: Load CV
    console.log('\\n2️⃣ Testing load_cv...');
    const loadResponse = await sendMCPRequest('tools/call', {
      name: 'load_cv',
      arguments: {
        filePath: path.join(__dirname, 'sample-resume.pdf')
      }
    });
    
    if (loadResponse.result) {
      console.log('✅ Load CV result:', loadResponse.result.content[0].text);
    } else if (loadResponse.error) {
      console.log('❌ Load CV error:', loadResponse.error.message);
    }

    // Test 3: Query CV
    console.log('\\n3️⃣ Testing query_cv...');
    const queryResponse = await sendMCPRequest('tools/call', {
      name: 'query_cv',
      arguments: {
        question: 'What programming languages does John Smith know?'
      }
    });
    
    if (queryResponse.result) {
      console.log('✅ Query CV result:', queryResponse.result.content[0].text);
    } else if (queryResponse.error) {
      console.log('❌ Query CV error:', queryResponse.error.message);
    }

    // Test 4: Test email connection (will fail without config, but should respond)
    console.log('\\n4️⃣ Testing test_email_connection...');
    const emailTestResponse = await sendMCPRequest('tools/call', {
      name: 'test_email_connection',
      arguments: {}
    });
    
    if (emailTestResponse.result) {
      console.log('✅ Email test result:', emailTestResponse.result.content[0].text);
    } else if (emailTestResponse.error) {
      console.log('❌ Email test error:', emailTestResponse.error.message);
    }

    console.log('\\n🎉 All MCP protocol tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('\\n🧹 Cleaning up...');
    server.kill();
  }
}

// Run the test
testMCPProtocol();
