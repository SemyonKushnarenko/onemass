import { User } from 'src/user/user.entity';
import { Psychologist } from 'src/psychologist/psychologist.entity';
import {
  Entity,
  PrimaryColumn,
  Generated,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export enum PaymentPurpose {
  PATIENT_SUBSCRIPTION = 'patient_subscription',
  ADD_PATIENT = 'add_patient',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @Generated('uuid')
  @IsUUID()
  id: string;

  @Column({ name: 'invoice_id', type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @Column({ name: 'payload', type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  payload?: string;

  @Column({ name: 'amount_stars', type: 'integer' })
  @IsNumber()
  amountStars: number;

  @Column({ name: 'purpose', type: 'varchar', length: 50 })
  @IsEnum(PaymentPurpose)
  purpose: PaymentPurpose;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @ManyToOne(() => Psychologist, { nullable: true })
  @JoinColumn({ name: 'psychologist_id' })
  psychologist?: Psychologist | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt?: Date;
}

