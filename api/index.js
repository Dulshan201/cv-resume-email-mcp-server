const http = require('http');

// Export as Vercel function
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    if (req.url === '/' || req.url === '') {
      res.status(200).json({
        name: 'cv-email-mcp-server',
        version: '1.0.0',
        status: 'running',
        mode: 'Serverless',
        platform: 'Vercel',
        endpoints: {
          health: '/health',
          tools: '/tools',
          docs: '/docs'
        },
        timestamp: new Date().toISOString()
      });
    } else if (req.url === '/health') {
      res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        platform: 'Vercel'
      });
    } else if (req.url === '/tools') {
      res.status(200).json({
        tools: [
          {
            name: 'load_cv',
            description: 'Load a CV/resume from a PDF file',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'query_cv',
            description: 'Query information from a loaded CV/resume',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'send_email',
            description: 'Send an email notification',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'test_email_connection',
            description: 'Test email service connection',
            inputSchema: { type: 'object', properties: {}, required: [] }
          }
        ]
      });
    } else if (req.url === '/docs') {
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CV & Email MCP Server</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; background: #fafafa; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
            .endpoint { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .method { background: #4CAF50; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.9em; font-weight: bold; }
            .badge { background: #FF6B6B; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px; }
            a { color: #667eea; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .status { text-align: center; padding: 20px; background: #d4edda; color: #155724; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🤖 CV & Email MCP Server</h1>
            <p>Model Context Protocol server providing CV parsing and email capabilities</p>
            <span class="badge">LIVE ON VERCEL</span>
          </div>
          
          <div class="status">
            <strong>✅ Server Status: ONLINE</strong><br>
            Deployed successfully on Vercel!
          </div>
          
          <h2>📍 Available Endpoints</h2>
          
          <div class="endpoint">
            <h3><span class="method">GET</span> /</h3>
            <p>Server information and status</p>
          </div>
          
          <div class="endpoint">
            <h3><span class="method">GET</span> /health</h3>
            <p>Health check endpoint</p>
          </div>
          
          <div class="endpoint">
            <h3><span class="method">GET</span> /tools</h3>
            <p>List all available MCP tools</p>
          </div>
          
          <div class="endpoint">
            <h3><span class="method">GET</span> /docs</h3>
            <p>This documentation page</p>
          </div>
          
          <h2>🛠️ Available Tools</h2>
          <ul>
            <li><strong>load_cv</strong> - Load a CV/resume from a PDF file</li>
            <li><strong>query_cv</strong> - Query information from a loaded CV/resume</li>
            <li><strong>send_email</strong> - Send email notifications</li>
            <li><strong>test_email_connection</strong> - Test email service</li>
          </ul>
          
          <h2>🔗 Links</h2>
          <p>
            <a href="https://github.com/Dulshan201/cv-resume-email-mcp-server" target="_blank">📁 GitHub Repository</a><br>
            <a href="https://modelcontextprotocol.io/" target="_blank">📚 MCP Documentation</a>
          </p>
        </body>
        </html>
      `);
    } else {
      res.status(404).json({ error: 'Not found', path: req.url });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
