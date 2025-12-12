import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentPurpose, PaymentStatus } from './payment.entity';
import { User } from 'src/user/user.entity';
import { UserCreatedVia } from 'src/user/user.types';
import { Referral, ReferralStatus } from 'src/psychologist/referral.entity';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createInvoiceLink(params: {
    amountStars: number;
    title: string;
    description: string;
    payload: string;
  }): Promise<string> {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('BOT_TOKEN is not set');
    }

    const url = `${TELEGRAM_API_BASE}/bot${botToken}/createInvoiceLink`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: params.title,
        description: params.description,
        payload: params.payload,
        currency: 'XTR',
        prices: [{ label: 'Stars', amount: params.amountStars }],
      }),
    });

    const json = await response.json();
    if (!json.ok) {
      Logger.error(
        `[PaymentService] createInvoiceLink failed ${JSON.stringify(json)}`,
      );
      throw new Error('Failed to create invoice link');
    }

    return json.result;
  }

  async createPaymentRecord(data: {
    amountStars: number;
    purpose: PaymentPurpose;
    payload?: string;
    user?: User | null;
  }): Promise<Payment> {
    const payment = this.paymentRepository.create({
      amountStars: data.amountStars,
      purpose: data.purpose,
      payload: data.payload,
      status: PaymentStatus.PENDING,
      user: data.user,
    });
    return this.paymentRepository.save(payment);
  }

  async markPaid(payload: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { payload },
      relations: ['user'],
    });
    if (!payment) return;
    payment.status = PaymentStatus.PAID;
    await this.paymentRepository.save(payment);

    if (payment.purpose === PaymentPurpose.PATIENT_SUBSCRIPTION && payment.user) {
      payment.user.subscriptionActive = true;
      payment.user.createdVia = UserCreatedVia.STARS;
      await this.userRepository.save(payment.user);
    }

    if (payment.purpose === PaymentPurpose.ADD_PATIENT) {
      const referral = await this.referralRepository.findOne({
        where: { refCode: payload },
      });
      if (referral) {
        referral.status = ReferralStatus.ACTIVE;
        await this.referralRepository.save(referral);
      }
    }
  }

  async isPaid(payload: string): Promise<boolean> {
    const payment = await this.paymentRepository.findOne({
      where: { payload, status: PaymentStatus.PAID },
    });
    return Boolean(payment);
  }
}