import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Mood } from './mood.entity';
import { User } from 'src/user/user.entity';
import { PsychologistPatient } from 'src/psychologist/psychologist-patient.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationType } from 'src/notification/notification-log.entity';

@Injectable()
export class MoodService {
  constructor(
    @InjectRepository(Mood)
    private readonly moodRepository: Repository<Mood>,
    @InjectRepository(PsychologistPatient)
    private readonly linkRepository: Repository<PsychologistPatient>,
    @InjectQueue('notifications')
    private readonly notificationsQueue: Queue,
  ) {}

  async submitMood(params: {
    user: User;
    value: number;
    comment?: string;
    date?: Date;
  }): Promise<Mood> {
    const entity = this.moodRepository.create({
      user: params.user,
      value: params.value,
      comment: params.comment,
      date: params.date ?? new Date(),
    });
    const saved = await this.moodRepository.save(entity);

    if (params.value < 3) {
      const links = await this.linkRepository.find({
        where: { patient: { id: params.user.id } },
        relations: ['psychologist', 'psychologist.user'],
      });
      for (const link of links) {
        const chatId = link.psychologist.user?.telegramId?.toString();
        if (!chatId) continue;
        await this.notificationsQueue.add('send', {
          chatId,
          text: `У пациента ${params.user.username ?? params.user.id} низкое настроение (${params.value}/5)`,
          type: NotificationType.LOW_MOOD_ALERT,
          payload: JSON.stringify({ patientId: params.user.id, value: params.value }),
        });
      }
    }

    return saved;
  }

  async listByUser(params: {
    user: User;
    from?: Date;
    to?: Date;
  }): Promise<Mood[]> {
    const from = params.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = params.to ?? new Date();
    return this.moodRepository.find({
      where: { user: { id: params.user.id }, date: Between(from, to) },
      order: { date: 'DESC' },
    });
  }

  async stats(params: { user: User }): Promise<{
    avgMonth: number | null;
    avgYear: number | null;
  }> {
    const now = new Date();
    const monthFrom = new Date(now);
    monthFrom.setMonth(monthFrom.getMonth() - 1);
    const yearFrom = new Date(now);
    yearFrom.setFullYear(yearFrom.getFullYear() - 1);

    const [month, year] = await Promise.all([
      this.moodRepository
        .createQueryBuilder('m')
        .select('AVG(m.value)', 'avg')
        .where('m.user_id = :userId', { userId: params.user.id })
        .andWhere('m.date BETWEEN :from AND :to', {
          from: monthFrom,
          to: now,
        })
        .getRawOne(),
      this.moodRepository
        .createQueryBuilder('m')
        .select('AVG(m.value)', 'avg')
        .where('m.user_id = :userId', { userId: params.user.id })
        .andWhere('m.date BETWEEN :from AND :to', {
          from: yearFrom,
          to: now,
        })
        .getRawOne(),
    ]);

    return {
      avgMonth: month?.avg ? parseFloat(month.avg) : null,
      avgYear: year?.avg ? parseFloat(year.avg) : null,
    };
  }
}
