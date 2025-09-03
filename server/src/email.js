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
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTools = exports.EmailService = void 0;
var nodemailer = require("nodemailer");
var zod_1 = require("zod");
// Schemas
var SendEmailSchema = zod_1.z.object({
    recipient: zod_1.z.string().email().describe('Email address of the recipient'),
    subject: zod_1.z.string().describe('Subject line of the email'),
    body: zod_1.z.string().describe('Body content of the email'),
    smtpHost: zod_1.z.string().optional().describe('SMTP host (defaults to Gmail)'),
    smtpPort: zod_1.z.number().optional().describe('SMTP port (defaults to 587)'),
    username: zod_1.z.string().optional().describe('SMTP username (will use environment variable if not provided)'),
    password: zod_1.z.string().optional().describe('SMTP password or app password (will use environment variable if not provided)')
});
var TestEmailSchema = zod_1.z.object({
    smtpHost: zod_1.z.string().optional().describe('SMTP host (defaults to Gmail)'),
    smtpPort: zod_1.z.number().optional().describe('SMTP port (defaults to 587)'),
    username: zod_1.z.string().optional().describe('SMTP username (will use environment variable if not provided)'),
    password: zod_1.z.string().optional().describe('SMTP password (will use environment variable if not provided)')
});
// Email Service class
var EmailService = /** @class */ (function () {
    function EmailService() {
        this.transporter = null;
    }
    EmailService.prototype.createTransporter = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var smtpHost, smtpPort, username, password;
            return __generator(this, function (_a) {
                smtpHost = (config === null || config === void 0 ? void 0 : config.smtpHost) || process.env.SMTP_HOST || 'smtp.gmail.com';
                smtpPort = (config === null || config === void 0 ? void 0 : config.smtpPort) || parseInt(process.env.SMTP_PORT || '587');
                username = (config === null || config === void 0 ? void 0 : config.username) || process.env.EMAIL_USERNAME;
                password = (config === null || config === void 0 ? void 0 : config.password) || process.env.EMAIL_PASSWORD;
                if (!username || !password) {
                    throw new Error('Email credentials not provided. Please set EMAIL_USERNAME and EMAIL_PASSWORD environment variables or provide them in the request.');
                }
                this.transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    secure: smtpPort === 465, // true for 465, false for other ports
                    auth: {
                        user: username,
                        pass: password,
                    },
                });
                return [2 /*return*/, this.transporter];
            });
        });
    };
    EmailService.prototype.sendEmail = function (emailRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var transporter, mailOptions, info, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.createTransporter({
                                smtpHost: emailRequest.smtpHost,
                                smtpPort: emailRequest.smtpPort,
                                username: emailRequest.username,
                                password: emailRequest.password
                            })];
                    case 1:
                        transporter = _a.sent();
                        mailOptions = {
                            from: emailRequest.username || process.env.EMAIL_USERNAME,
                            to: emailRequest.recipient,
                            subject: emailRequest.subject,
                            text: emailRequest.body,
                            html: "<div style=\"font-family: Arial, sans-serif; line-height: 1.6;\">\n          ".concat(emailRequest.body.replace(/\n/g, '<br>'), "\n        </div>")
                        };
                        return [4 /*yield*/, transporter.sendMail(mailOptions)];
                    case 2:
                        info = _a.sent();
                        return [2 /*return*/, "Email sent successfully to ".concat(emailRequest.recipient, ". Message ID: ").concat(info.messageId)];
                    case 3:
                        error_1 = _a.sent();
                        throw new Error("Failed to send email: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.testConnection = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var transporter, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.createTransporter(config)];
                    case 1:
                        transporter = _a.sent();
                        return [4 /*yield*/, transporter.verify()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, 'Email service connection verified successfully'];
                    case 3:
                        error_2 = _a.sent();
                        throw new Error("Email service connection failed: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return EmailService;
}());
exports.EmailService = EmailService;
// Global email service instance
var emailService = new EmailService();
// Tool definitions
exports.emailTools = [
    {
        name: "send_email",
        description: "Send an email notification with specified recipient, subject, and body",
        inputSchema: SendEmailSchema,
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, emailService.sendEmail({
                            recipient: args.recipient,
                            subject: args.subject,
                            body: args.body,
                            smtpHost: args.smtpHost,
                            smtpPort: args.smtpPort,
                            username: args.username,
                            password: args.password
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }
    },
    {
        name: "test_email_connection",
        description: "Test the email service connection and configuration",
        inputSchema: TestEmailSchema,
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, emailService.testConnection(args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }
    }
];
