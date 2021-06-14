import { RolesEntity } from 'src/modules/roles/entities/roles.entity';
import {
  Entity,
  PrimaryColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from './user.entity';

@Entity({ schema: 'mod_users', name: 'agents' })
export class AgentsEntity {
  @PrimaryColumn({
    type: 'integer',
  })
  @OneToOne(() => UsersEntity)
  @JoinColumn({ name: 'user' })
  user: UsersEntity;

  @ManyToOne(() => RolesEntity, { nullable: false })
  @JoinColumn({ name: 'role' })
  role: RolesEntity;

  @Column({ nullable: true })
  expiration_date: Date;

  @Column({ default: true })
  active: boolean;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
