import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { TemplateType } from '../entities/template.entity';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Newsletter mensual' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ enum: TemplateType, default: TemplateType.TEMPLATE, required: false })
  @IsOptional()
  @IsEnum(TemplateType)
  type?: TemplateType;

  // Requerido solo para plantillas completas; una firma no lleva asunto
  @ApiProperty({ example: 'Novedades de {empresa} para ti', required: false })
  @ValidateIf((dto) => (dto.type ?? TemplateType.TEMPLATE) === TemplateType.TEMPLATE)
  @IsString()
  @MinLength(1)
  subject?: string;

  @ApiProperty({ example: 'Hola {nombre},\n\nEste mes tenemos...' })
  @IsString()
  @MinLength(1)
  body: string;
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {}
