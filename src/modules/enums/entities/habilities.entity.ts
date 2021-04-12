import { TechniccianEntity } from 'src/modules/users/entities/techniccian.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Exclusion,
} from 'typeorm';
import { HabilitiesGroupsEntity } from './habilities_groups.entity';
import { HabilitiesRequirementsEntity } from './habilities_reqs.entity';

@Entity({
  name: 'habilities',
  schema: 'mod_enums',
})
export class HabilitiesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => HabilitiesGroupsEntity, { nullable: false })
  @JoinColumn({ name: 'group' })
  group: HabilitiesGroupsEntity;

  @OneToMany(() => HabilitiesRequirementsEntity, (req) => req.hability, {
    cascade: true,
  })
  requirements: HabilitiesRequirementsEntity[];

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @ManyToMany(() => TechniccianEntity, (t) => t.habilities)
  techs: TechniccianEntity[];
}
