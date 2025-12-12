import { Psychologist } from 'src/psychologist/psychologist.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryColumn,
  Generated,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsNumberString,
} from 'class-validator';

export enum NotificationType {
  DAILY_REMINDER = 'daily_reminder',
  LOW_MOOD_ALERT = 'low_mood_alert',
  GENERIC = 'generic',
}

@Entity({ name: 'notifications_log' })
export class NotificationLog {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @Generated('uuid')
  @IsUUID()
  id: string;

  @Column({ name: 'recipient_telegram_id', type: 'bigint', nullable: true })
  @IsOptional()
  @IsNumberString()
  recipientTelegramId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @ManyToOne(() => Psychologist, { nullable: true })
  @JoinColumn({ name: 'psychologist_id' })
  psychologist?: Psychologist | null;

  @Column({ name: 'type', type: 'varchar', length: 50 })
  @IsEnum(NotificationType)
  type: NotificationType;

  @Column({ name: 'payload', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  payload?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt?: Date;
}

