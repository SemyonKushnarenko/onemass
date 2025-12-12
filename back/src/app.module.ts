import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceFactory } from './database';
import { MoodModule } from './mood/mood.module';
import { AuthModule } from './auth/auth.module';
import { PsychologistModule } from './psychologist/psychologist.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationModule } from './notification/notification.module';
import { AppController } from './app.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: dataSourceFactory }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
    }),
    UserModule,
    MoodModule,
    AuthModule,
    PsychologistModule,
    PaymentModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
