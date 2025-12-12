import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationLog,
  NotificationType,
} from './notification-log.entity';
import { User } from 'src/user/user.entity';
import { Psychologist } from 'src/psychologist/psychologist.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserService } from 'src/user/user.service';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationRepository: Repository<NotificationLog>,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    const cron = process.env.DAILY_NOTIFY_CRON ?? '0 9 * * *';
    await this.notificationsQueue.add(
      'daily-broadcast',
      { kind: 'daily-broadcast' },
      { repeat: { cron }, removeOnComplete: true, removeOnFail: true },
    );
  }

  async sendTelegramMessage(params: {
    chatId: string | number;
    text: string;
  }): Promise<void> {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      Logger.warn('BOT_TOKEN not set; skipping Telegram send');
      return;
    }
    const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: params.chatId, text: params.text }),
    });
    if (!resp.ok) {
      Logger.error(`[NotificationService] sendMessage failed ${resp.status}`);
    }
  }

  async logNotification(data: {
    recipientTelegramId?: string;
    user?: User | null;
    psychologist?: Psychologist | null;
    type: NotificationType;
    payload?: string;
  }): Promise<NotificationLog> {
    const record = this.notificationRepository.create({
      recipientTelegramId: data.recipientTelegramId,
      user: data.user,
      psychologist: data.psychologist,
      type: data.type,
      payload: data.payload,
    });
    return this.notificationRepository.save(record);
  }

  async broadcastDaily(): Promise<void> {
    const patients = await this.userService.getPatientsWithTelegram();
    for (const patient of patients) {
      const chatId = patient.telegramId?.toString();
      if (!chatId) continue;
      await this.notificationsQueue.add('send', {
        kind: 'send',
        chatId,
        text: 'Не забудьте отметить своё сегодняшнее настроение',
        type: NotificationType.DAILY_REMINDER,
      });
    }
  }
}

