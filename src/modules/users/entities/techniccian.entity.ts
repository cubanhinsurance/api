import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UsersEntity } from './user.entity';

@Entity({ schema: 'mod_users', name: 'techniccians' })
export class TechniccianEntity {
  @PrimaryColumn({ type: 'integer', nullable: false })
  @OneToOne(() => UsersEntity)
  @JoinColumn({ name: 'user' })
  user: UsersEntity;
}
