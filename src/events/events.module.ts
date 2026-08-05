import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [AuthModule], // provee JwtService para autenticar la conexión del socket
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
