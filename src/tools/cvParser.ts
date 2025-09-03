import * as fs from 'fs';
import * as path from 'path';
import { CVData, WorkExperience, Education } from '../types';
import { z } from 'zod';

const pdf = require('pdf-parse');

const CVQuerySchema = z.object({
  question: z.string().describe('Question about the CV/resume'),
  filePath: z.string().optional().describe('Path to the CV file (optional if already loaded)')
});

export class CVParser {
  private cvData: CVData | null = null;
  private rawText: string = '';

  async loadCV(filePath: string): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`CV file not found: ${filePath}`);
      }

      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      this.rawText = data.text;
      this.cvData = this.parseCV(data.text);
    } catch (error) {
      throw new Error(`Failed to load CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseCV(text: string): CVData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Basic parsing logic - this would be enhanced with better NLP
    const cvData: CVData = {
      personalInfo: {},
      workExperience: [],
      education: [],
      skills: [],
      certifications: []
    };

    // Extract personal information
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      cvData.personalInfo.email = emailMatch[0];
    }

    const phoneMatch = text.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);
    if (phoneMatch) {
      cvData.personalInfo.phone = phoneMatch[0];
    }

    // Extract name (typically the first line or large text)
    if (lines.length > 0 && lines[0]) {
      cvData.personalInfo.name = lines[0];
    }

    // Extract work experience
    const workSectionIndex = this.findSectionIndex(lines, ['experience', 'work', 'employment', 'career']);
    if (workSectionIndex !== -1) {
      cvData.workExperience = this.extractWorkExperience(lines, workSectionIndex);
    }

    // Extract education
    const educationSectionIndex = this.findSectionIndex(lines, ['education', 'academic', 'qualification']);
    if (educationSectionIndex !== -1) {
      cvData.education = this.extractEducation(lines, educationSectionIndex);
    }

    // Extract skills
    const skillsSectionIndex = this.findSectionIndex(lines, ['skills', 'technical', 'competencies']);
    if (skillsSectionIndex !== -1) {
      cvData.skills = this.extractSkills(lines, skillsSectionIndex);
    }

    return cvData;
  }

  private findSectionIndex(lines: string[], keywords: string[]): number {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const lineLower = line.toLowerCase();
      if (keywords.some(keyword => lineLower.includes(keyword))) {
        return i;
      }
    }
    return -1;
  }

  private extractWorkExperience(lines: string[], startIndex: number): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    let currentExp: Partial<WorkExperience> = {};
    
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      // Stop if we hit another section
      if (this.isSectionHeader(line)) break;
      
      // Try to identify company/position
      if (line.match(/\d{4}/) && line.includes('-')) {
        // This looks like a date range, save previous experience
        if (currentExp.company && currentExp.position) {
          experiences.push(currentExp as WorkExperience);
          currentExp = {};
        }
        
        // Extract dates
        const dateMatch = line.match(/(\d{4}).*?(\d{4}|present|current)/i);
        if (dateMatch && dateMatch[1] && dateMatch[2]) {
          currentExp.startDate = dateMatch[1];
          currentExp.endDate = dateMatch[2];
        }
      } else if (!currentExp.company && line.length > 0) {
        currentExp.company = line;
      } else if (!currentExp.position && line.length > 0) {
        currentExp.position = line;
      } else if (line.length > 0) {
        currentExp.description = (currentExp.description || '') + ' ' + line;
      }
    }

    // Add the last experience
    if (currentExp.company && currentExp.position) {
      experiences.push(currentExp as WorkExperience);
    }

    return experiences;
  }

  private extractEducation(lines: string[], startIndex: number): Education[] {
    const education: Education[] = [];
    let currentEd: Partial<Education> = {};
    
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      // Stop if we hit another section
      if (this.isSectionHeader(line)) break;
      
      if (line.length > 0) {
        if (!currentEd.institution) {
          currentEd.institution = line;
        } else if (!currentEd.degree) {
          currentEd.degree = line;
        } else {
          currentEd.field = line;
          education.push(currentEd as Education);
          currentEd = {};
        }
      }
    }

    return education;
  }

  private extractSkills(lines: string[], startIndex: number): string[] {
    const skills: string[] = [];
    
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      // Stop if we hit another section
      if (this.isSectionHeader(line)) break;
      
      if (line.length > 0) {
        // Split by common delimiters
        const lineSkills = line.split(/[,•\-\n\t]/).map(s => s.trim()).filter(s => s.length > 0);
        skills.push(...lineSkills);
      }
    }

    return skills;
  }

  private isSectionHeader(line: string): boolean {
    const lowerLine = line.toLowerCase();
    const sectionKeywords = ['experience', 'education', 'skills', 'certifications', 'projects', 'achievements'];
    return sectionKeywords.some(keyword => lowerLine.includes(keyword));
  }

  async queryCV(question: string): Promise<string> {
    if (!this.cvData) {
      return "No CV data loaded. Please load a CV file first.";
    }

    const lowerQuestion = question.toLowerCase();
    
    // Answer questions about work experience
    if (lowerQuestion.includes('position') || lowerQuestion.includes('role') || lowerQuestion.includes('job')) {
      if (lowerQuestion.includes('last') || lowerQuestion.includes('recent') || lowerQuestion.includes('current')) {
        const lastJob = this.cvData.workExperience[0];
        if (lastJob) {
          return `Your last position was ${lastJob.position} at ${lastJob.company} from ${lastJob.startDate} to ${lastJob.endDate}.`;
        }
      }
      return `Your work experience includes: ${this.cvData.workExperience.map(exp => 
        `${exp.position} at ${exp.company}`).join(', ')}`;
    }

    // Answer questions about skills
    if (lowerQuestion.includes('skill') || lowerQuestion.includes('technology') || lowerQuestion.includes('tech')) {
      return `Your skills include: ${this.cvData.skills.join(', ')}`;
    }

    // Answer questions about education
    if (lowerQuestion.includes('education') || lowerQuestion.includes('degree') || lowerQuestion.includes('university')) {
      return `Your education: ${this.cvData.education.map(edu => 
        `${edu.degree} from ${edu.institution}`).join(', ')}`;
    }

    // Answer questions about contact info
    if (lowerQuestion.includes('contact') || lowerQuestion.includes('email') || lowerQuestion.includes('phone')) {
      const contact = this.cvData.personalInfo;
      return `Contact information: ${contact.email ? `Email: ${contact.email}` : ''} ${contact.phone ? `Phone: ${contact.phone}` : ''}`;
    }

    // General search in raw text
    const questionWords = question.toLowerCase().split(' ');
    const relevantLines = this.rawText.split('\n').filter(line => 
      questionWords.some(word => line.toLowerCase().includes(word))
    );

    if (relevantLines.length > 0) {
      return `Based on your CV: ${relevantLines.slice(0, 3).join(' ')}`;
    }

    return "I couldn't find specific information about that in your CV. Please try rephrasing your question or ask about work experience, skills, education, or contact information.";
  }

  getCVData(): CVData | null {
    return this.cvData;
  }
}

export const cvQueryTool = {
  name: "query_cv",
  description: "Query information from a loaded CV/resume",
  inputSchema: CVQuerySchema,
  handler: async (args: z.infer<typeof CVQuerySchema>) => {
    const cvParser = new CVParser();
    
    if (args.filePath) {
      await cvParser.loadCV(args.filePath);
    }
    
    return await cvParser.queryCV(args.question);
  }
};

export const loadCVTool = {
  name: "load_cv",
  description: "Load a CV/resume from a PDF file",
  inputSchema: z.object({
    filePath: z.string().describe('Path to the PDF CV file')
  }),
  handler: async (args: { filePath: string }) => {
    const cvParser = new CVParser();
    await cvParser.loadCV(args.filePath);
    const cvData = cvParser.getCVData();
    return `CV loaded successfully. Found ${cvData?.workExperience.length || 0} work experiences, ${cvData?.education.length || 0} education entries, and ${cvData?.skills.length || 0} skills.`;
  }
};
