import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { LicensesTypesEntity } from 'src/modules/enums/entities/licenses_types.entity';
import { MunicialitiesEntity } from 'src/modules/enums/entities/municipalities.entity';
import { ProvincesEntity } from 'src/modules/enums/entities/provinces.entity';
import { AgentsEntity } from 'src/modules/users/entities/agent.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IssuesEntity } from './issues.entity';

@Entity({
  schema: 'mod_bussines',
  name: 'ratings',
})
export class RatingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'from' })
  @Index()
  from: UsersEntity;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'to' })
  @Index()
  to: UsersEntity;

  @Column()
  @Index()
  date: Date;

  @Column()
  rating: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  like: boolean;

  @Column({ default: true })
  tech_review: boolean;

  @ManyToOne(() => IssuesEntity, { nullable: true })
  issue: IssuesEntity;
}
