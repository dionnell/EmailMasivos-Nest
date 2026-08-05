import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'Cuántas filas se necesitan',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'Cuántas filas se deben saltar',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiProperty({
    required: false,
    description: 'Query para filtrar resultados (nombre o email)',
    example: 'juan',
  })
  @IsOptional()
  @Type(() => String)
  q?: string;
}
