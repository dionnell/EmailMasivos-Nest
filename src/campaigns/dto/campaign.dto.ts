import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Newsletter Junio' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: '¡Novedades de este mes para ti!' })
  @IsString()
  @MinLength(1)
  subject: string;

  @ApiProperty({ example: 'Hola {nombre}, tenemos novedades...' })
  @IsString()
  @MinLength(10)
  body: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({ example: 'Mi Empresa', required: false, description: 'Nombre visible del remitente' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  fromName?: string;

  @ApiProperty({
    example: 'noreply@tudominio.com',
    required: false,
    description: 'Email remitente. Si no se especifica, se usa MAIL_FROM del .env',
  })
  @IsOptional()
  @IsEmail()
  fromEmail?: string;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}
