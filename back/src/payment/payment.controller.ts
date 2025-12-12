import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentPurpose, PaymentStatus } from './payment.entity';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { AuthorizedRequest } from 'src/auth/auth.types';
import { TelegramAuthGuard } from 'src/guards/telegram.guard';
import { PsychologistService } from 'src/psychologist/psychologist.service';

class CreateSubscriptionDto {
  @IsInt()
  @Min(1)
  amountStars = 100;

  @IsOptional()
  @IsString()
  payload?: string;
}

class AddPatientDto {
  @IsOptional()
  @IsString()
  payload?: string;
}

class PaymentWebhookDto {
  @IsString()
  payload: string;
}

@Controller('billing')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly psychologistService: PsychologistService,
  ) {}

  @UseGuards(TelegramAuthGuard)
  @Post('subscribe')
  async subscribe(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateSubscriptionDto,
  ) {
    const payload = dto.payload ?? `sub-${Date.now()}`;
    const record = await this.paymentService.createPaymentRecord({
      amountStars: dto.amountStars,
      purpose: PaymentPurpose.PATIENT_SUBSCRIPTION,
      payload,
      user: req.user,
    });

    const link = await this.paymentService.createInvoiceLink({
      amountStars: dto.amountStars,
      title: 'Mood Tracker subscription',
      description: 'Access to mood tracking features',
      payload: payload,
    });

    return { invoiceUrl: link, paymentId: record.id, payload };
  }

  @UseGuards(TelegramAuthGuard)
  @Post('add-patient')
  async addPatient(@Req() req: AuthorizedRequest, @Body() dto: AddPatientDto) {
    const psychologist = await this.psychologistService.ensurePsychologist(
      req.user!,
    );
    const { referral, invoiceUrl, payload } =
      await this.psychologistService.createReferral(psychologist, dto.payload);
    return { invoiceUrl, payload, referral };
  }

  @Post('webhook')
  async webhook(@Body() dto: PaymentWebhookDto) {
    await this.paymentService.markPaid(dto.payload);
    return { status: PaymentStatus.PAID };
  }
}

