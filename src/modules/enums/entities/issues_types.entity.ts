import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { HabilityRuleOr } from '../dtos/habilities.dto';
import { IssuesQuestionsDTO } from '../dtos/questions.dto';

@Entity({
  name: 'issues_types',
  schema: 'mod_enums',
})
export class IssuesTypesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => IssuesTypesEntity, { nullable: true })
  @JoinColumn({ name: 'parent' })
  parent: IssuesTypesEntity;

  @OneToMany(() => IssuesTypesEntity, (i) => i.parent)
  childs: IssuesTypesEntity[];

  @Column({ nullable: true, type: 'jsonb' })
  questions: IssuesQuestionsDTO[];

  @Column({ nullable: true, type: 'jsonb' })
  rules: HabilityRuleOr;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;
}
