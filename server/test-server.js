// Simple test script for the MCP server
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing CV & Email MCP Server...\n');

// Test 1: Check if server starts without errors
console.log('Test 1: Starting MCP Server...');

const serverPath = path.join(__dirname, 'dist', 'index.js');
console.log('Server path:', serverPath);

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('📤 Server output:', data.toString().trim());
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('💬 Server stderr:', data.toString().trim());
});

server.on('close', (code) => {
  console.log(`\n🏁 Server exited with code: ${code}`);
  if (code === 0) {
    console.log('✅ Server started successfully!');
  } else {
    console.log('❌ Server failed to start');
    console.log('Error output:', errorOutput);
  }
});

// Test 2: Send MCP list tools request
console.log('\nTest 2: Sending MCP list tools request...');

setTimeout(() => {
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

// Test 3: Test tool call (query CV without loading)
setTimeout(() => {
  console.log('\nTest 3: Testing CV query tool...');
  
  const toolCallRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'query_cv',
      arguments: {
        question: 'What is my name?'
      }
    }
  };

  server.stdin.write(JSON.stringify(toolCallRequest) + '\n');
}, 2000);

// Cleanup after 5 seconds
setTimeout(() => {
  console.log('\n🧹 Cleaning up test...');
  server.kill();
}, 5000);

console.log('Test script started. Monitoring for 5 seconds...\n');
