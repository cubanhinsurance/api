import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { HabilitiesEntity } from './habilities.entity';

@Entity({
  name: 'habilities_groups',
  schema: 'mod_enums',
})
export class HabilitiesGroupsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @OneToMany(() => HabilitiesEntity, (h) => h.group)
  habilities: HabilitiesEntity;
}
