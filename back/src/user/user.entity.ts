import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  OneToMany,
} from 'typeorm';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsNumberString,
} from 'class-validator';
import { UserCreatedVia, UserRole } from './user.types';
import { Mood } from 'src/mood/mood.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @Generated('uuid')
  @IsUUID()
  id: string;

  @Column({ name: 'telegram_id', type: 'bigint' })
  @IsOptional()
  @IsNumberString()
  telegramId?: string;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  username: string;

  @Column({ name: 'first_name', type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  firstName: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt?: Date;

  @Column({
    name: 'created_via',
    enum: UserCreatedVia,
    default: UserCreatedVia.OTHER,
  })
  @IsEnum(UserCreatedVia)
  createdVia: UserCreatedVia;

  @Column({ name: 'role', enum: UserRole, default: UserRole.PATIENT })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ name: 'subscription_active', type: 'boolean', default: false })
  subscriptionActive: boolean;

  @OneToMany(() => Mood, (mood) => mood.user)
  moods: Mood[];
}
