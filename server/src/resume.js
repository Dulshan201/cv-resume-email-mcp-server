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
exports.resumeTools = exports.CVParser = void 0;
var zod_1 = require("zod");
var pdf_js_1 = require("./parsers/pdf.js");
// Schemas
var LoadCVSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to the PDF CV file')
});
var QueryCVSchema = zod_1.z.object({
    question: zod_1.z.string().describe('Question about the CV/resume'),
    filePath: zod_1.z.string().optional().describe('Path to the CV file (optional if already loaded)')
});
// CV Parser class
var CVParser = /** @class */ (function () {
    function CVParser() {
        this.cvData = null;
        this.rawText = '';
        this.pdfParser = new pdf_js_1.PDFParser();
    }
    CVParser.prototype.loadCV = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var text, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pdfParser.parsePDF(filePath)];
                    case 1:
                        text = (_a.sent()).text;
                        this.rawText = text;
                        this.cvData = this.parseCV(text);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Failed to load CV: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CVParser.prototype.parseCV = function (text) {
        var lines = text.split('\n').map(function (line) { return line.trim(); }).filter(function (line) { return line.length > 0; });
        var cvData = {
            personalInfo: {},
            workExperience: [],
            education: [],
            skills: [],
            certifications: []
        };
        // Extract personal information
        var emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
            cvData.personalInfo.email = emailMatch[0];
        }
        var phoneMatch = text.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);
        if (phoneMatch) {
            cvData.personalInfo.phone = phoneMatch[0];
        }
        // Extract name (typically the first line)
        if (lines.length > 0 && lines[0]) {
            cvData.personalInfo.name = lines[0];
        }
        // Extract sections
        var workSectionIndex = this.findSectionIndex(lines, ['experience', 'work', 'employment', 'career']);
        if (workSectionIndex !== -1) {
            cvData.workExperience = this.extractWorkExperience(lines, workSectionIndex);
        }
        var educationSectionIndex = this.findSectionIndex(lines, ['education', 'academic', 'qualification']);
        if (educationSectionIndex !== -1) {
            cvData.education = this.extractEducation(lines, educationSectionIndex);
        }
        var skillsSectionIndex = this.findSectionIndex(lines, ['skills', 'technical', 'competencies']);
        if (skillsSectionIndex !== -1) {
            cvData.skills = this.extractSkills(lines, skillsSectionIndex);
        }
        return cvData;
    };
    CVParser.prototype.findSectionIndex = function (lines, keywords) {
        var _loop_1 = function (i) {
            var line = lines[i];
            if (!line)
                return "continue";
            var lineLower = line.toLowerCase();
            if (keywords.some(function (keyword) { return lineLower.includes(keyword); })) {
                return { value: i };
            }
        };
        for (var i = 0; i < lines.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return -1;
    };
    CVParser.prototype.extractWorkExperience = function (lines, startIndex) {
        var experiences = [];
        var currentExp = {};
        for (var i = startIndex + 1; i < lines.length; i++) {
            var line = lines[i];
            if (!line)
                continue;
            if (this.isSectionHeader(line))
                break;
            if (line.match(/\d{4}/) && line.includes('-')) {
                if (currentExp.company && currentExp.position) {
                    experiences.push(currentExp);
                    currentExp = {};
                }
                var dateMatch = line.match(/(\d{4}).*?(\d{4}|present|current)/i);
                if (dateMatch && dateMatch[1] && dateMatch[2]) {
                    currentExp.startDate = dateMatch[1];
                    currentExp.endDate = dateMatch[2];
                }
            }
            else if (!currentExp.company && line.length > 0) {
                currentExp.company = line;
            }
            else if (!currentExp.position && line.length > 0) {
                currentExp.position = line;
            }
            else if (line.length > 0) {
                currentExp.description = (currentExp.description || '') + ' ' + line;
            }
        }
        if (currentExp.company && currentExp.position) {
            experiences.push(currentExp);
        }
        return experiences;
    };
    CVParser.prototype.extractEducation = function (lines, startIndex) {
        var education = [];
        var currentEd = {};
        for (var i = startIndex + 1; i < lines.length; i++) {
            var line = lines[i];
            if (!line)
                continue;
            if (this.isSectionHeader(line))
                break;
            if (line.length > 0) {
                if (!currentEd.institution) {
                    currentEd.institution = line;
                }
                else if (!currentEd.degree) {
                    currentEd.degree = line;
                }
                else {
                    currentEd.field = line;
                    education.push(currentEd);
                    currentEd = {};
                }
            }
        }
        return education;
    };
    CVParser.prototype.extractSkills = function (lines, startIndex) {
        var skills = [];
        for (var i = startIndex + 1; i < lines.length; i++) {
            var line = lines[i];
            if (!line)
                continue;
            if (this.isSectionHeader(line))
                break;
            if (line.length > 0) {
                var lineSkills = line.split(/[,•\-\n\t]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
                skills.push.apply(skills, lineSkills);
            }
        }
        return skills;
    };
    CVParser.prototype.isSectionHeader = function (line) {
        var lowerLine = line.toLowerCase();
        var sectionKeywords = ['experience', 'education', 'skills', 'certifications', 'projects', 'achievements'];
        return sectionKeywords.some(function (keyword) { return lowerLine.includes(keyword); });
    };
    CVParser.prototype.queryCV = function (question) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerQuestion, lastJob, contact, questionWords, relevantLines;
            return __generator(this, function (_a) {
                if (!this.cvData) {
                    return [2 /*return*/, "No CV data loaded. Please load a CV file first."];
                }
                lowerQuestion = question.toLowerCase();
                // Answer questions about work experience
                if (lowerQuestion.includes('position') || lowerQuestion.includes('role') || lowerQuestion.includes('job')) {
                    if (lowerQuestion.includes('last') || lowerQuestion.includes('recent') || lowerQuestion.includes('current')) {
                        lastJob = this.cvData.workExperience[0];
                        if (lastJob) {
                            return [2 /*return*/, "Your last position was ".concat(lastJob.position, " at ").concat(lastJob.company, " from ").concat(lastJob.startDate, " to ").concat(lastJob.endDate, ".")];
                        }
                    }
                    return [2 /*return*/, "Your work experience includes: ".concat(this.cvData.workExperience.map(function (exp) {
                            return "".concat(exp.position, " at ").concat(exp.company);
                        }).join(', '))];
                }
                // Answer questions about skills
                if (lowerQuestion.includes('skill') || lowerQuestion.includes('technology') || lowerQuestion.includes('tech')) {
                    return [2 /*return*/, "Your skills include: ".concat(this.cvData.skills.join(', '))];
                }
                // Answer questions about education
                if (lowerQuestion.includes('education') || lowerQuestion.includes('degree') || lowerQuestion.includes('university')) {
                    return [2 /*return*/, "Your education: ".concat(this.cvData.education.map(function (edu) {
                            return "".concat(edu.degree, " from ").concat(edu.institution);
                        }).join(', '))];
                }
                // Answer questions about contact info
                if (lowerQuestion.includes('contact') || lowerQuestion.includes('email') || lowerQuestion.includes('phone')) {
                    contact = this.cvData.personalInfo;
                    return [2 /*return*/, "Contact information: ".concat(contact.email ? "Email: ".concat(contact.email) : '', " ").concat(contact.phone ? "Phone: ".concat(contact.phone) : '')];
                }
                questionWords = question.toLowerCase().split(' ');
                relevantLines = this.rawText.split('\n').filter(function (line) {
                    return questionWords.some(function (word) { return line.toLowerCase().includes(word); });
                });
                if (relevantLines.length > 0) {
                    return [2 /*return*/, "Based on your CV: ".concat(relevantLines.slice(0, 3).join(' '))];
                }
                return [2 /*return*/, "I couldn't find specific information about that in your CV. Please try rephrasing your question or ask about work experience, skills, education, or contact information."];
            });
        });
    };
    CVParser.prototype.getCVData = function () {
        return this.cvData;
    };
    return CVParser;
}());
exports.CVParser = CVParser;
// Global CV parser instance
var cvParser = new CVParser();
// Tool definitions
exports.resumeTools = [
    {
        name: "load_cv",
        description: "Load a CV/resume from a PDF file",
        inputSchema: LoadCVSchema,
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            var cvData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cvParser.loadCV(args.filePath)];
                    case 1:
                        _a.sent();
                        cvData = cvParser.getCVData();
                        return [2 /*return*/, "CV loaded successfully. Found ".concat((cvData === null || cvData === void 0 ? void 0 : cvData.workExperience.length) || 0, " work experiences, ").concat((cvData === null || cvData === void 0 ? void 0 : cvData.education.length) || 0, " education entries, and ").concat((cvData === null || cvData === void 0 ? void 0 : cvData.skills.length) || 0, " skills.")];
                }
            });
        }); }
    },
    {
        name: "query_cv",
        description: "Query information from a loaded CV/resume",
        inputSchema: QueryCVSchema,
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!args.filePath) return [3 /*break*/, 2];
                        return [4 /*yield*/, cvParser.loadCV(args.filePath)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, cvParser.queryCV(args.question)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        }); }
    }
];
