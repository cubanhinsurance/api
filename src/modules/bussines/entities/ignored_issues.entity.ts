import { UsersEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { IssuesEntity } from './issues.entity';

export enum IGNORED_ISSUE_REASON {
  IGNORED = 'ignored',
  REFUSED = 'refused',
}

@Entity()
export class IgnoredIssuesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'user' })
  @Index()
  user: UsersEntity;

  @ManyToOne(() => IssuesEntity)
  @JoinColumn({ name: 'issue' })
  @Index()
  issue: IssuesEntity;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: IGNORED_ISSUE_REASON.IGNORED })
  reason: IGNORED_ISSUE_REASON;
}
