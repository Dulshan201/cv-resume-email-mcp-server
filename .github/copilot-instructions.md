# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Model Context Protocol (MCP) server project written in TypeScript. The server provides:

1. **CV/Resume Parsing**: Ability to parse PDF resumes and answer questions about work experience, skills, and career history
2. **Email Notifications**: Tool to send emails with specified recipients, subjects, and body content
3. **MCP Protocol Compliance**: Implements the Model Context Protocol specification for tool discovery and execution

## Key Technologies:
- TypeScript
- @modelcontextprotocol/sdk
- pdf-parse for CV parsing
- nodemailer for email functionality
- zod for schema validation

## Architecture:
- `src/server.ts` - Main MCP server implementation
- `src/tools/` - Individual tool implementations
- `src/types/` - TypeScript type definitions
- `playground/` - Next.js frontend for testing

You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt

For SDK reference, see: https://github.com/modelcontextprotocol/create-python-server
