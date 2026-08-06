import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Verifica si el servicio de envío está configurado y con qué remitente' })
  getStatus() {
    return {
      configured: !!this.configService.get<string>('RESEND_API_KEY'),
      // Remitente REAL que se va a usar al enviar (MAIL_FROM o el fallback @resend.dev)
      from: this.mailService.getDefaultFrom(),
      // true si MAIL_FROM está configurado explícitamente (dominio propio de la empresa)
      hasCustomDomain: !!this.configService.get<string>('MAIL_FROM'),
    };
  }
}
