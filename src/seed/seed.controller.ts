import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiOperation({
    summary: 'Recrea usuarios de prueba',
    description:
      'Borra todos los usuarios y crea un admin y un usuario de prueba. Útil solo en desarrollo, NO ejecutar en producción.',
  })
  @ApiResponse({ status: 200, description: 'Seed ejecutado con éxito' })
  executeSeed() {
    return this.seedService.runSeed();
  }
}
