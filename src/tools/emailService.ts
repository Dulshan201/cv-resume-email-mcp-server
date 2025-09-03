import * as nodemailer from 'nodemailer';
import { EmailRequest } from '../types';
import { z } from 'zod';

const EmailSchema = z.object({
  recipient: z.string().email().describe('Email address of the recipient'),
  subject: z.string().describe('Subject line of the email'),
  body: z.string().describe('Body content of the email'),
  smtpHost: z.string().optional().describe('SMTP host (defaults to Gmail)'),
  smtpPort: z.number().optional().describe('SMTP port (defaults to 587)'),
  username: z.string().optional().describe('SMTP username (will use environment variable if not provided)'),
  password: z.string().optional().describe('SMTP password or app password (will use environment variable if not provided)')
});

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async createTransporter(config?: {
    smtpHost?: string;
    smtpPort?: number;
    username?: string;
    password?: string;
  }): Promise<nodemailer.Transporter> {
    const smtpHost = config?.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = config?.smtpPort || parseInt(process.env.SMTP_PORT || '587');
    const username = config?.username || process.env.EMAIL_USERNAME;
    const password = config?.password || process.env.EMAIL_PASSWORD;

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

    return this.transporter;
  }

  async sendEmail(emailRequest: EmailRequest & {
    smtpHost?: string;
    smtpPort?: number;
    username?: string;
    password?: string;
  }): Promise<string> {
    try {
      const transporter = await this.createTransporter({
        smtpHost: emailRequest.smtpHost,
        smtpPort: emailRequest.smtpPort,
        username: emailRequest.username,
        password: emailRequest.password
      });

      const mailOptions = {
        from: emailRequest.username || process.env.EMAIL_USERNAME,
        to: emailRequest.recipient,
        subject: emailRequest.subject,
        text: emailRequest.body,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${emailRequest.body.replace(/\n/g, '<br>')}
        </div>`
      };

      const info = await transporter.sendMail(mailOptions);
      return `Email sent successfully to ${emailRequest.recipient}. Message ID: ${info.messageId}`;
    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(config?: {
    smtpHost?: string;
    smtpPort?: number;
    username?: string;
    password?: string;
  }): Promise<string> {
    try {
      const transporter = await this.createTransporter(config);
      await transporter.verify();
      return 'Email service connection verified successfully';
    } catch (error) {
      throw new Error(`Email service connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const sendEmailTool = {
  name: "send_email",
  description: "Send an email notification with specified recipient, subject, and body",
  inputSchema: EmailSchema,
  handler: async (args: z.infer<typeof EmailSchema>) => {
    const emailService = new EmailService();
    
    return await emailService.sendEmail({
      recipient: args.recipient,
      subject: args.subject,
      body: args.body,
      smtpHost: args.smtpHost,
      smtpPort: args.smtpPort,
      username: args.username,
      password: args.password
    });
  }
};

export const testEmailTool = {
  name: "test_email_connection",
  description: "Test the email service connection and configuration",
  inputSchema: z.object({
    smtpHost: z.string().optional().describe('SMTP host (defaults to Gmail)'),
    smtpPort: z.number().optional().describe('SMTP port (defaults to 587)'),
    username: z.string().optional().describe('SMTP username (will use environment variable if not provided)'),
    password: z.string().optional().describe('SMTP password (will use environment variable if not provided)')
  }),
  handler: async (args: {
    smtpHost?: string;
    smtpPort?: number;
    username?: string;
    password?: string;
  }) => {
    const emailService = new EmailService();
    return await emailService.testConnection(args);
  }
};
