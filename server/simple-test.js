const { spawn } = require('child_process');
const path = require('path');

// Simple test that sends one request at a time
async function testMCPServer() {
  console.log('🧪 Testing MCP Server Tools...');
  
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Test 1: List tools
  console.log('\\n📋 Test 1: Listing tools...');
  const listToolsRequest = {
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 1
  };
  
  server.stdin.write(JSON.stringify(listToolsRequest) + '\\n');
  
  // Wait for response
  await new Promise(resolve => {
    server.stdout.on('data', (data) => {
      const response = data.toString();
      console.log('Response:', response);
      if (response.includes('"result"')) {
        const parsed = JSON.parse(response);
        if (parsed.result && parsed.result.tools) {
          console.log('✅ Found tools:');
          parsed.result.tools.forEach(tool => {
            console.log(`  - ${tool.name}: ${tool.description}`);
          });
        }
      }
      resolve();
    });
    
    setTimeout(resolve, 2000); // Timeout after 2 seconds
  });

  // Test 2: Query CV (should return no data message)
  console.log('\\n💬 Test 2: Querying CV...');
  const queryCVRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'query_cv',
      arguments: {
        query: 'What skills does this person have?'
      }
    },
    id: 2
  };
  
  server.stdin.write(JSON.stringify(queryCVRequest) + '\\n');
  
  // Wait for response
  await new Promise(resolve => {
    const timeout = setTimeout(resolve, 2000);
    server.stdout.on('data', (data) => {
      const response = data.toString();
      if (response.includes('"id":2')) {
        try {
          const parsed = JSON.parse(response);
          if (parsed.result && parsed.result.content) {
            console.log('✅ CV Query Response:', parsed.result.content[0].text);
          }
        } catch (e) {
          console.log('Response:', response);
        }
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  // Test 3: Test email connection
  console.log('\\n📧 Test 3: Testing email connection...');
  const testEmailRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'test_email_connection',
      arguments: {}
    },
    id: 3
  };
  
  server.stdin.write(JSON.stringify(testEmailRequest) + '\\n');
  
  // Wait for response
  await new Promise(resolve => {
    const timeout = setTimeout(resolve, 2000);
    server.stdout.on('data', (data) => {
      const response = data.toString();
      if (response.includes('"id":3')) {
        try {
          const parsed = JSON.parse(response);
          if (parsed.result && parsed.result.content) {
            console.log('✅ Email Test Response:', parsed.result.content[0].text);
          }
        } catch (e) {
          console.log('Response:', response);
        }
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  console.log('\\n🏁 Test completed!');
  server.kill();
}

testMCPServer().catch(console.error);
