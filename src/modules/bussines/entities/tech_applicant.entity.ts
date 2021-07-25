import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
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

@Entity({
  schema: 'mod_bussines',
  name: 'tech_applicant',
})
export class TechApplicantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'user' })
  @Index()
  user: UsersEntity;

  @Column()
  @Index()
  date: Date;

  @ManyToMany(() => HabilitiesEntity)
  @JoinTable()
  habilities: HabilitiesEntity[];

  @Column({ nullable: true })
  description: string;

  @Column()
  address: string;

  @Column()
  ci: string;

  @ManyToOne(() => ProvincesEntity)
  @JoinColumn({ name: 'provinces' })
  @Index()
  province: ProvincesEntity;

  @ManyToOne(() => MunicialitiesEntity)
  @JoinColumn({ name: 'municipality' })
  @Index()
  municipality: MunicialitiesEntity;

  @ManyToOne(() => AgentsEntity, { nullable: true })
  @JoinColumn({ name: 'agent' })
  @Index()
  agent: AgentsEntity;

  @Column({ nullable: true })
  @Index()
  response_date: Date;

  @Column({ nullable: true })
  approved: boolean;

  @Column()
  confirmation_photo: string;
}
