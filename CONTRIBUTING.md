# Contributing to CV Resume Email MCP Server

Thank you for your interest in contributing! Here are some guidelines:

## How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests** if applicable
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/cv-resume-email-mcp-server.git
cd cv-resume-email-mcp-server

# Install dependencies
cd server && npm install
cd ../web && npm install

# Build and test
cd ../server
npm run build
npm test
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Ensure all tests pass

## Reporting Issues

- Use the GitHub issue tracker
- Include steps to reproduce
- Provide system information
- Include relevant logs

## Feature Requests

- Check existing issues first
- Provide clear use case
- Consider implementation approach
- Be open to discussion

Thank you for contributing! 🎉
