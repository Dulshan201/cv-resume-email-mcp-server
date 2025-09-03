import * as fs from 'fs';

const pdf = require('pdf-parse');

export interface ParsedPDF {
  text: string;
  pages: number;
  info?: any;
}

export class PDFParser {
  async parsePDF(filePath: string): Promise<ParsedPDF> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`PDF file not found: ${filePath}`);
      }

      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async parsePDFFromBuffer(buffer: Buffer): Promise<ParsedPDF> {
    try {
      const data = await pdf(buffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF from buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  extractTextFromPages(text: string, startPage?: number, endPage?: number): string {
    if (!startPage && !endPage) {
      return text;
    }

    // This is a simplified page extraction - in a real implementation,
    // you'd need more sophisticated page boundary detection
    const lines = text.split('\n');
    const totalLines = lines.length;
    
    if (startPage && endPage) {
      const startIndex = Math.floor((startPage - 1) * totalLines / 10);
      const endIndex = Math.floor(endPage * totalLines / 10);
      return lines.slice(startIndex, endIndex).join('\n');
    }
    
    return text;
  }

  cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
  }
}
