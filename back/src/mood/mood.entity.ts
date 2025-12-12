import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Generated,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  Min,
  Max,
  IsInt,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

@Entity({ name: 'moods' })
export class Mood {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column({ name: 'comment', type: 'varchar', length: 1000, nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;

  @Column({ name: 'value', type: 'integer' })
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsInt()
  value: number;

  @Column({ name: 'date', type: 'date' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ManyToOne(() => User, (user) => user.moods)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt?: Date;
}
