import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { HabilitiesEntity } from './habilities.entity';

@Entity({
  name: 'habilities_requirements',
  schema: 'mod_enums',
})
export class HabilitiesRequirementsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => HabilitiesEntity, { nullable: false })
  @JoinColumn({ name: 'hability' })
  hability: HabilitiesEntity;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;
}
