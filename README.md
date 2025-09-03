# CV Resume Email MCP Server

A Model Context Protocol (MCP) server that provides CV/resume parsing and email notification capabilities. This project enables AI assistants to read PDF resumes, extract information, and send email notifications through a standardized MCP interface.

## Features

- **CV/Resume Parsing**: Parse PDF resumes and answer questions about work experience, skills, and career history
- **Email Notifications**: Send emails with specified recipients, subjects, and body content
- **MCP Protocol Compliance**: Implements the Model Context Protocol specification for tool discovery and execution
- **Next.js Playground**: Optional web interface for testing the MCP server

## Project Structure

```
mcp-cv-email/
  server/                 # MCP Server implementation
    src/
      index.ts           # Main server entry point
      resume.ts          # CV parsing functionality
      email.ts           # Email sending functionality
      parsers/
        pdf.ts           # PDF parsing utilities
    package.json
    .env.example
  web/                   # Next.js playground (optional)
    app/
      page.tsx           # Main playground interface
      api/mcp/[transport]/route.ts  # MCP API adapter
    package.json
    .env.local.example
  README.md
```

## Quick Start

### 1. Server Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your email credentials
npm run build
npm start
```

### 2. Web Playground (Optional)

```bash
cd web
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

## Configuration

### Email Setup

For Gmail (recommended):
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in your `.env` file

```env
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### VS Code Integration

Add to your VS Code `settings.json`:

```json
{
  "mcp.servers": {
    "cv-email-server": {
      "type": "stdio",
      "command": "node",
      "args": ["path/to/server/dist/index.js"]
    }
  }
}
```

## Available Tools

### CV Tools

- **load_cv**: Load a CV/resume from a PDF file
  ```json
  {
    "filePath": "/path/to/resume.pdf"
  }
  ```

- **query_cv**: Query information from a loaded CV
  ```json
  {
    "question": "What was my last position?",
    "filePath": "/path/to/resume.pdf" // optional if already loaded
  }
  ```

### Email Tools

- **send_email**: Send an email notification
  ```json
  {
    "recipient": "recipient@example.com",
    "subject": "Subject line",
    "body": "Email content",
    "smtpHost": "smtp.gmail.com", // optional
    "smtpPort": 587, // optional
    "username": "your-email@gmail.com", // optional, uses env var
    "password": "your-app-password" // optional, uses env var
  }
  ```

- **test_email_connection**: Test email service configuration
  ```json
  {
    "smtpHost": "smtp.gmail.com", // optional
    "smtpPort": 587, // optional
    "username": "your-email@gmail.com", // optional
    "password": "your-app-password" // optional
  }
  ```

## Example Queries

### CV Questions
- "What role did I have at my last position?"
- "What are my technical skills?"
- "Where did I go to university?"
- "What companies have I worked for?"
- "What is my contact information?"

### Email Examples
- Send status updates
- Notify about completed tasks
- Share CV insights with recruiters

## Development

### Server Development
```bash
cd server
npm run watch  # Watch mode for development
npm run build  # Build for production
npm run clean  # Clean build directory
```

### Web Development
```bash
cd web
npm run dev    # Development server
npm run build  # Build for production
npm run lint   # Lint code
```

## Dependencies

### Server
- @modelcontextprotocol/sdk - MCP protocol implementation
- pdf-parse - PDF text extraction
- nodemailer - Email sending
- zod - Schema validation

### Web
- Next.js 14 - React framework
- React 18 - UI library
- Tailwind CSS - Styling
- TypeScript - Type safety

## Troubleshooting

### Common Issues

1. **PDF parsing fails**: Ensure the PDF is text-based, not scanned images
2. **Email sending fails**: Check your SMTP credentials and app password
3. **MCP connection issues**: Verify the server path in your MCP client configuration

### Error Codes
- `CV file not found`: The specified PDF file path doesn't exist
- `No CV data loaded`: You need to load a CV before querying it
- `Email credentials not provided`: Set EMAIL_USERNAME and EMAIL_PASSWORD environment variables
- `Email service connection failed`: Check SMTP settings and credentials

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review the MCP documentation at https://modelcontextprotocol.io/
- Open an issue in the repository
