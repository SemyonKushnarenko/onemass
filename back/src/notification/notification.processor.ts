import { Process, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationService } from './notification.service';
import {
  NotificationLog,
  NotificationType,
} from './notification-log.entity';

export type NotificationJob =
  | {
      kind: 'send';
      chatId: string | number;
      text: string;
      type: NotificationType;
      payload?: string;
    }
  | {
      kind: 'daily-broadcast';
    };

@Processor('notifications')
export class NotificationProcessor {
  constructor(private readonly notificationService: NotificationService) {}

  @Process('send')
  async handleSend(job: Job<NotificationJob>): Promise<NotificationLog | void> {
    if (job.data.kind !== 'send') return;
    const { chatId, text, type, payload } = job.data;
    await this.notificationService.sendTelegramMessage({ chatId, text });
    return this.notificationService.logNotification({
      recipientTelegramId: chatId.toString(),
      type,
      payload,
    });
  }

  @Process('daily-broadcast')
  async handleDaily(job: Job<NotificationJob>): Promise<void> {
    if (job.data.kind !== 'daily-broadcast') return;
    await this.notificationService.broadcastDaily();
  }
}

