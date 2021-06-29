import { RolesEntity } from 'src/modules/roles/entities/roles.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  BaseEntity,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AgentsEntity } from './agent.entity';
import { TechniccianEntity } from './techniccian.entity';

@Entity({
  name: 'users',
  schema: 'mod_users',
})
export class UsersEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  lastname: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  telegram_id: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  expiration_date: Date;

  @OneToOne(() => AgentsEntity, (a) => a.user, { nullable: true })
  agent_info: AgentsEntity;

  @OneToOne(() => TechniccianEntity, (t) => t.user, { nullable: true })
  techniccian_info: TechniccianEntity;

  @Column({ nullable: true })
  photo: string;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: true })
  confirmed: boolean;

  @Column({ default: 1 })
  hotp: number;

  @Column({ nullable: true })
  totp: string;

  @Column({ default: false })
  enable_totp: boolean;
}
