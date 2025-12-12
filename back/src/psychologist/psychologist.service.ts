import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Psychologist } from './psychologist.entity';
import { PsychologistPatient } from './psychologist-patient.entity';
import { Referral, ReferralStatus } from './referral.entity';
import { User } from 'src/user/user.entity';
import { UserRole } from 'src/user/user.types';
import { PaymentPurpose } from 'src/payment/payment.entity';
import { PaymentService } from 'src/payment/payment.service';
import { randomUUID } from 'node:crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationType } from 'src/notification/notification-log.entity';

@Injectable()
export class PsychologistService {
  constructor(
    @InjectRepository(Psychologist)
    private readonly psychologistRepo: Repository<Psychologist>,
    @InjectRepository(PsychologistPatient)
    private readonly linkRepo: Repository<PsychologistPatient>,
    @InjectRepository(Referral)
    private readonly referralRepo: Repository<Referral>,
    private readonly paymentService: PaymentService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async ensurePsychologist(user: User): Promise<Psychologist> {
    if (user.role !== UserRole.PSYCHOLOGIST) {
      throw new ForbiddenException('User is not a psychologist');
    }
    let psych = await this.psychologistRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
    if (!psych) {
      psych = this.psychologistRepo.create({ user });
      psych = await this.psychologistRepo.save(psych);
    }
    return psych;
  }

  async listPatients(psychologistId: string): Promise<User[]> {
    const links = await this.linkRepo.find({
      where: { psychologist: { id: psychologistId } },
      relations: ['patient', 'patient.moods'],
    });
    return links.map((l) => l.patient);
  }

  async getPatientLink(psychologistId: string, patientId: string) {
    return this.linkRepo.findOne({
      where: {
        psychologist: { id: psychologistId },
        patient: { id: patientId },
      },
      relations: ['psychologist', 'patient', 'patient.moods'],
    });
  }

  async createReferral(
    psychologist: Psychologist,
    payloadOverride?: string,
  ): Promise<{
    referral: Referral;
    invoiceUrl: string;
    payload: string;
  }> {
    const refCode = randomUUID();
    const payload = payloadOverride ?? refCode;

    const paymentRecord = await this.paymentService.createPaymentRecord({
      amountStars: 10,
      purpose: PaymentPurpose.ADD_PATIENT,
      payload,
      user: psychologist.user,
    });

    const link = await this.paymentService.createInvoiceLink({
      amountStars: paymentRecord.amountStars,
      title: 'Add patient',
      description: 'Add new patient via referral',
      payload,
    });

    const referral = await this.referralRepo.save(
      this.referralRepo.create({
        refCode,
        psychologist,
        status: ReferralStatus.ACTIVE,
      }),
    );

    return { referral, invoiceUrl: link, payload };
  }

  async activateReferral(refCode: string, patient: User): Promise<void> {
    const referral = await this.referralRepo.findOne({
      where: { refCode },
      relations: ['psychologist'],
    });
    if (!referral) {
      throw new Error('Referral not found');
    }
    const paid = await this.paymentService.isPaid(refCode);
    if (!paid) {
      throw new Error('Referral payment not completed');
    }
    referral.status = ReferralStatus.USED;
    await this.referralRepo.save(referral);

    const link = this.linkRepo.create({
      psychologist: referral.psychologist,
      patient,
    });
    await this.linkRepo.save(link);

    const chatId = referral.psychologist.user?.telegramId?.toString();
    if (chatId) {
      await this.notificationsQueue.add('send', {
        chatId,
        text: `Новый пациент подключён по рефералу ${referral.refCode}`,
        type: NotificationType.GENERIC,
      });
    }
  }
}

