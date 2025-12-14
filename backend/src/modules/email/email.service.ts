import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;
  private readonly logger = new Logger(EmailService.name);

  private ensureTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secureEnv = process.env.SMTP_SECURE; // 'true' | 'false'

    if (!host || !port || !user || !pass) {
      throw new Error(
        'SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables.'
      );
    }

    const secure = secureEnv === 'true' || (secureEnv === undefined && port === 465);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    return this.transporter;
  }

  async send(params: SendEmailParams) {
    const transporter = this.ensureTransporter();
    const from = params.from ?? process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'no-reply@example.com';

    const info = await transporter.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    this.logger.log(`Email sent: ${info.messageId}`);
    return info;
  }
}
