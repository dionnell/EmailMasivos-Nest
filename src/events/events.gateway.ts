import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Gateway único para eventos en vivo relacionados con el envío de campañas
 * y el tracking de emails (aperturas, bounces, quejas).
 *
 * No mantiene estado de "clientes conectados" — solo transmite (broadcast)
 * los eventos a todos los que estén conectados y autenticados. Pensado para
 * alimentar un dashboard administrativo en tiempo real.
 *
 * Namespace: /events
 * Autenticación: JWT (mismo token que usan las rutas @Auth() de la API REST),
 * enviado como `auth: { token }` o `headers.authentication` al conectar.
 */
@WebSocketGateway({ cors: true, namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger('EventsGateway');

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string) ??
      (client.handshake.headers.authentication as string);

    try {
      this.jwtService.verify(token);
    } catch (error) {
      this.logger.warn(`Conexión rechazada (token inválido): ${client.id}`);
      client.disconnect();
      return;
    }

    this.logger.debug(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Cliente desconectado: ${client.id}`);
  }

  // ---- Emisores usados por otros servicios (campaigns, tracking, webhooks) ----

  emitCampaignProgress(payload: {
    campaignId: string;
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
  }) {
    this.server.emit('campaign:progress', payload);
  }

  emitCampaignDone(payload: {
    campaignId: string;
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
  }) {
    this.server.emit('campaign:done', payload);
  }

  emitEmailOpened(payload: {
    campaignId: string | null;
    sendLogId: string;
    email: string;
    openCount: number;
    firstOpen: boolean;
  }) {
    this.server.emit('email:opened', payload);
  }

  emitEmailBounced(payload: {
    email: string;
    type: 'hard' | 'soft';
    campaignId?: string;
  }) {
    this.server.emit('email:bounced', payload);
  }

  emitEmailComplained(payload: { email: string }) {
    this.server.emit('email:complained', payload);
  }
}
