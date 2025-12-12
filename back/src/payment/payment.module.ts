import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { UserModule } from 'src/user/user.module';
import { Referral } from 'src/psychologist/referral.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Referral]),
    forwardRef(() => UserModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}

