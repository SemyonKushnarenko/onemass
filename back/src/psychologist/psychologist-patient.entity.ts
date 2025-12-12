import { User } from 'src/user/user.entity';
import { Psychologist } from './psychologist.entity';
import {
  Entity,
  PrimaryColumn,
  Generated,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';

@Entity({ name: 'psychologist_patients' })
export class PsychologistPatient {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @Generated('uuid')
  @IsUUID()
  id: string;

  @ManyToOne(() => Psychologist, { nullable: false })
  @JoinColumn({ name: 'psychologist_id' })
  psychologist: Psychologist;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient: User;
}

