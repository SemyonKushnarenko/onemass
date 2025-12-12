import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Psychologist } from './psychologist.entity';
import { PsychologistPatient } from './psychologist-patient.entity';
import { Referral } from './referral.entity';
import { PsychologistService } from './psychologist.service';
import { PsychologistController } from './psychologist.controller';
import { PaymentModule } from 'src/payment/payment.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { ReferralController } from './referral.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Psychologist, PsychologistPatient, Referral]),
    PaymentModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  providers: [PsychologistService],
  controllers: [PsychologistController, ReferralController],
  exports: [PsychologistService],
})
export class PsychologistModule {}

