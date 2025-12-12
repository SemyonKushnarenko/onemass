import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryColumn,
  Generated,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';

@Entity({ name: 'psychologists' })
export class Psychologist {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  @Generated('uuid')
  @IsUUID()
  id: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

