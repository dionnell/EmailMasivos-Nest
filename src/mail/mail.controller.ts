import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly configService: ConfigService) {}

  @Get('status')
  @ApiOperation({ summary: 'Verifica si el servicio de envío está configurado' })
  getStatus() {
    return {
      configured: !!this.configService.get<string>('RESEND_API_KEY'),
      from:       this.configService.get<string>('MAIL_FROM') ?? null,
    };
  }
}
