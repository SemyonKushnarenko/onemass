import { Module } from '@nestjs/common';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';
import { Mood } from './mood.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PsychologistPatient } from 'src/psychologist/psychologist-patient.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mood, PsychologistPatient]),
    AuthModule,
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [MoodController],
  providers: [MoodService],
})
export class MoodModule {}
