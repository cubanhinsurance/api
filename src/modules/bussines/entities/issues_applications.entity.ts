import { columns } from '@atlasjs/typeorm-crud';
import { TechniccianEntity } from 'src/modules/users/entities/techniccian.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { IssuesEntity } from './issues.entity';

export enum ISSUE_APPLICATION_STATE {
  PENDENT = 'pendent',
  REFUSED = 'refused',
  ACCEPTED = 'accepted',
}

@Entity({
  schema: 'mod_bussines',
  name: 'issues_applications',
})
export class IssueApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'tech' })
  @Index()
  tech: UsersEntity;

  @ManyToOne(() => IssuesEntity)
  @JoinColumn({ name: 'issue' })
  @Index()
  issue: IssuesEntity;

  @Column({ default: ISSUE_APPLICATION_STATE.PENDENT })
  @Index()
  state: ISSUE_APPLICATION_STATE;

  @Column({ nullable: true })
  message: string;

  @Column()
  min_price: number;

  @Column()
  max_price: number;

  @Column({ nullable: true })
  min_date: Date;

  @Column({ nullable: true })
  max_date: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;
}
