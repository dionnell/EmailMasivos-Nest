import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface Attachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string; // "Nombre <email@dominio.com>" — si no se envía, se usa MAIL_FROM
  attachments?: Attachment[];
}

interface SendEmailResult {
  id?: string;
  error?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private readonly client: Resend | null;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.defaultFrom = this.configService.get<string>('MAIL_FROM');

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no está configurada — el envío de emails fallará');
      this.client = null;
      return;
    }

    this.client = new Resend(apiKey);
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.client) {
      const msg = 'RESEND_API_KEY no está configurada';
      this.logger.error(msg);
      return { error: msg };
    }

    try {
      const { data, error } = await this.client.emails.send({
        from:        options.from ?? this.defaultFrom,
        to:          options.to,
        subject:     options.subject,
        html:        options.html,
        attachments: options.attachments?.map((a) => ({
          filename:    a.filename,
          content:     a.content,
          contentType: a.contentType,
        })),
      });

      if (error) {
        this.logger.warn(`Error Resend para ${options.to}: ${error.message}`);
        return { error: error.message };
      }

      return { id: data.id };
    } catch (err) {
      this.logger.error(`Excepción enviando a ${options.to}`, err);
      return { error: err.message ?? 'Error desconocido' };
    }
  }

  textToHtml(text: string): string {
    return text
      .split('\n')
      .map((line) => `<p>${line || '&nbsp;'}</p>`)
      .join('');
  }

  interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);
  }
}
