import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UsersEntity } from './user.entity';

@Entity({ schema: 'mod_users', name: 'techniccians' })
export class TechniccianEntity {
  @PrimaryColumn({ type: 'integer', nullable: false })
  @OneToOne(() => UsersEntity)
  @JoinColumn({ name: 'user' })
  user: UsersEntity;

  @Column({ nullable: true })
  expiration_date: Date;

  @Column({ default: true })
  active: boolean;

  @ManyToMany(() => HabilitiesEntity)
  @JoinTable()
  habilities: HabilitiesEntity[];
}
