import { Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification-log.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserService } from 'src/user/user.service';

@Controller('events/notify')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  @Post('daily')
  async triggerDaily() {
    await this.notificationService.broadcastDaily();
    return { ok: true };
  }
}

