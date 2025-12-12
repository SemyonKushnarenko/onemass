import { Psychologist } from './psychologist.entity';
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
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ReferralStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
}

@Entity({ name: 'referrals' })
export class Referral {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @Generated('uuid')
  @IsUUID()
  id: string;

  @Column({ name: 'ref_code', type: 'varchar', length: 50, unique: true })
  @IsString()
  @Length(3, 50)
  refCode: string;

  @ManyToOne(() => Psychologist, { nullable: false })
  @JoinColumn({ name: 'psychologist_id' })
  psychologist: Psychologist;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt?: Date;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: ReferralStatus.ACTIVE,
  })
  @IsEnum(ReferralStatus)
  status: ReferralStatus;
}

