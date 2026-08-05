import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule }       from './auth/auth.module';
import { SeedModule }       from './seed/seed.module';
import { MailModule }       from './mail/mail.module';
import { RecipientsModule } from './recipients/recipients.module';
import { TemplatesModule }  from './templates/templates.module';
import { CampaignsModule }  from './campaigns/campaigns.module';
import { DashboardModule }  from './dashboard/dashboard.module';
import { WebhooksModule }   from './webhooks/webhooks.module';
import { TrackingModule }   from './tracking/tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl: process.env.STAGE === 'prod'
              ? { rejectUnauthorized: false }
              : null
      },
      type:             'postgres',
      host:             process.env.DB_HOST,
      port:             +process.env.DB_PORT,
      database:         process.env.DB_NAME,
      username:         process.env.DB_USERNAME,
      password:         process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize:      true,
    }),

    // Autenticación
    AuthModule,
    SeedModule,

    // Envío de email masivo con Resend
    MailModule,
    RecipientsModule,
    TemplatesModule,
    CampaignsModule,
    DashboardModule,
    WebhooksModule,
    TrackingModule,
  ],
})
export class AppModule {}
