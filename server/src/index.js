#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables first
var dotenv = require("dotenv");
dotenv.config();
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var resume_1 = require("./resume");
var email_1 = require("./email");
var http = require("http");
var MCPServer = /** @class */ (function () {
    function MCPServer() {
        this.server = new index_js_1.Server({
            name: 'cv-email-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    MCPServer.prototype.setupToolHandlers = function () {
        var _this = this;
        // Combine all tools
        var allTools = __spreadArray(__spreadArray([], resume_1.resumeTools, true), email_1.emailTools, true);
        // List available tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        tools: allTools.map(function (tool) { return ({
                            name: tool.name,
                            description: tool.description,
                            inputSchema: tool.inputSchema,
                        }); }),
                    }];
            });
        }); });
        // Handle tool calls
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(_this, void 0, void 0, function () {
            var _a, name, args, tool, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = request.params, name = _a.name, args = _a.arguments;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        tool = allTools.find(function (t) { return t.name === name; });
                        if (!tool) {
                            throw new Error("Unknown tool: ".concat(name));
                        }
                        return [4 /*yield*/, tool.handler(args)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: result,
                                    },
                                ],
                            }];
                    case 3:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: "Error: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'),
                                    },
                                ],
                                isError: true,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    MCPServer.prototype.setupErrorHandling = function () {
        var _this = this;
        this.server.onerror = function (error) {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.server.close()];
                    case 1:
                        _a.sent();
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    MCPServer.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!process.env.PORT) return [3 /*break*/, 1];
                        console.log('🚀 Detected PORT environment variable - starting HTTP server mode');
                        this.startHttpServer();
                        return [3 /*break*/, 3];
                    case 1:
                        transport = new stdio_js_1.StdioServerTransport();
                        return [4 /*yield*/, this.server.connect(transport)];
                    case 2:
                        _a.sent();
                        console.error('CV & Email MCP Server running on stdio');
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MCPServer.prototype.startHttpServer = function () {
        var port = process.env.PORT || 3000;
        var httpServer = http.createServer(function (req, res) {
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }
            if (req.method === 'GET' && req.url === '/') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    name: 'CV Resume Email MCP Server',
                    version: '1.0.0',
                    status: 'running',
                    tools: ['load_cv', 'query_cv', 'send_email', 'test_email_connection'],
                    description: 'Model Context Protocol server for CV parsing and email notifications',
                    endpoints: {
                        health: '/health',
                        tools: '/tools',
                        docs: '/docs'
                    },
                    repository: 'https://github.com/Dulshan201/cv-resume-email-mcp-server'
                }, null, 2));
            }
            else if (req.method === 'GET' && req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    port: port
                }));
            }
            else if (req.method === 'GET' && req.url === '/tools') {
                var allTools = __spreadArray(__spreadArray([], resume_1.resumeTools, true), email_1.emailTools, true);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    tools: allTools.map(function (tool) { return ({
                        name: tool.name,
                        description: tool.description,
                    }); }),
                }, null, 2));
            }
            else if (req.method === 'GET' && req.url === '/docs') {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end("\n          <!DOCTYPE html>\n          <html>\n          <head>\n            <title>CV Resume Email MCP Server</title>\n            <style>\n              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }\n              .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n              .tool { background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #1976d2; }\n              .endpoint { background: #f3e5f5; padding: 10px; margin: 5px 0; border-radius: 3px; }\n              h1 { color: #1976d2; }\n              h2 { color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 5px; }\n              .success { color: #4caf50; font-weight: bold; }\n            </style>\n          </head>\n          <body>\n            <div class=\"container\">\n              <h1>\uD83D\uDE80 CV Resume Email MCP Server</h1>\n              <p class=\"success\">\u2705 Server is running successfully!</p>\n              <p>Model Context Protocol server for CV parsing and email notifications</p>\n              \n              <h2>\uD83D\uDCCB Available Tools</h2>\n              <div class=\"tool\">\n                <h3>\uD83D\uDD0D load_cv</h3>\n                <p>Load and parse a PDF resume file for analysis</p>\n              </div>\n              <div class=\"tool\">\n                <h3>\uD83D\uDCAC query_cv</h3>\n                <p>Query information from loaded CV using natural language</p>\n              </div>\n              <div class=\"tool\">\n                <h3>\uD83D\uDCE7 send_email</h3>\n                <p>Send email notifications with custom recipient, subject, and body</p>\n              </div>\n              <div class=\"tool\">\n                <h3>\uD83D\uDD27 test_email_connection</h3>\n                <p>Test email service configuration and connectivity</p>\n              </div>\n\n              <h2>\uD83D\uDD17 API Endpoints</h2>\n              <div class=\"endpoint\">\n                <strong>GET /</strong> - Server information and status\n              </div>\n              <div class=\"endpoint\">\n                <strong>GET /health</strong> - Health check endpoint  \n              </div>\n              <div class=\"endpoint\">\n                <strong>GET /tools</strong> - List all available MCP tools\n              </div>\n              <div class=\"endpoint\">\n                <strong>GET /docs</strong> - This documentation page\n              </div>\n\n              <h2>\uD83D\uDD27 Usage</h2>\n              <p>This server implements the Model Context Protocol (MCP) for AI assistants to interact with CV parsing and email capabilities.</p>\n              <p>For local MCP usage, run the server without HTTP_MODE environment variable.</p>\n              \n              <h2>\uD83D\uDCD6 Links</h2>\n              <p>\n                <a href=\"https://github.com/Dulshan201/cv-resume-email-mcp-server\" target=\"_blank\">\uD83D\uDCC1 GitHub Repository</a><br>\n                <a href=\"https://modelcontextprotocol.io/\" target=\"_blank\">\uD83D\uDCDA MCP Documentation</a>\n              </p>\n            </div>\n          </body>\n          </html>\n        ");
            }
            else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found', path: req.url }));
            }
        });
        httpServer.listen(Number(port), function () {
            console.log("\uD83D\uDE80 CV & Email MCP Server running on port ".concat(port));
            console.log("\uD83D\uDCD6 Documentation: http://localhost:".concat(port, "/docs"));
            console.log("\uD83D\uDD27 Tools API: http://localhost:".concat(port, "/tools"));
            console.log("\u2764\uFE0F  Health Check: http://localhost:".concat(port, "/health"));
        });
    };
    return MCPServer;
}());
// Start the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var server;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    server = new MCPServer();
                    return [4 /*yield*/, server.run()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    main().catch(function (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}
