import { ClientLocationsEntity } from 'src/modules/client/entities/locations.entity';
import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { IssuesTypesEntity } from 'src/modules/enums/entities/issues_types.entity';
import { LicensesTypesEntity } from 'src/modules/enums/entities/licenses_types.entity';
import { MunicialitiesEntity } from 'src/modules/enums/entities/municipalities.entity';
import { ProvincesEntity } from 'src/modules/enums/entities/provinces.entity';
import { AgentsEntity } from 'src/modules/users/entities/agent.entity';
import { TechniccianEntity } from 'src/modules/users/entities/techniccian.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ISSUE_STATE {
  CREATED = 'created',
  ACCEPTED = 'accepted',
  CANCELED = 'canceled',
  EXPIRATED = 'expirated',
  PROGRESS = 'progress',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

@Entity({
  schema: 'mod_bussines',
  name: 'issues',
})
export class IssuesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => IssuesTypesEntity)
  @JoinColumn({ name: 'type' })
  @Index()
  type: IssuesTypesEntity;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'user' })
  @Index()
  user: UsersEntity;

  @Column()
  @Index()
  date: Date;

  @Column({ default: false })
  scheduled: boolean;

  @Column({ nullable: true })
  scheduled_description: string;

  @Column({ nullable: true })
  @Index()
  init_date: Date;

  @Column({ nullable: true })
  @Index()
  end_date: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'geometry', nullable: true, spatialFeatureType: 'Point' })
  @Index({ spatial: true })
  location: any;

  @Column({ default: ISSUE_STATE.CREATED })
  @Index()
  state: ISSUE_STATE;

  @Column({ type: 'jsonb' })
  data: object;

  @Column({ nullable: true })
  @Index()
  expiration_date: Date;

  @ManyToOne(() => TechniccianEntity, { nullable: true })
  @JoinColumn({ name: 'tech' })
  @Index()
  tech: TechniccianEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @Column({ nullable: true })
  minium_cost: number;

  @Column({ nullable: true })
  maxium_cost: number;

  @ManyToMany(() => IssuesTraces)
  @JoinTable()
  traces: IssuesTraces[];

  @ManyToOne(() => ClientLocationsEntity, { nullable: true })
  @Index()
  client_location: ClientLocationsEntity;

  @Column({ nullable: true })
  max_techs: number;

  @Column({ nullable: true })
  max_distance: number;
}

@Entity({
  schema: 'mod_bussines',
  name: 'issues_traces',
})
export class IssuesTraces {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: ISSUE_STATE.CREATED })
  @Index()
  state: ISSUE_STATE;

  @Column()
  @Index()
  date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;
}
