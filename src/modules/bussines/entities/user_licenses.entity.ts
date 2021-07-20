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
import { LicensesEntity } from './licenses.entity';
import { TransactionsEntity } from './transactions.entity';

@Entity({
  schema: 'mod_bussines',
  name: 'user_licenses',
})
export class UserLicensesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LicensesEntity)
  @JoinColumn({ name: 'type' })
  @Index()
  type: LicensesEntity;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'user' })
  @Index()
  user: UsersEntity;

  @Column({ nullable: true })
  @Index()
  expiration: Date;

  @ManyToOne(() => TransactionsEntity)
  @JoinColumn({ name: 'transaction' })
  @Index()
  transaction: TransactionsEntity;

  @Column()
  @Index()
  active: boolean;

  @Column({ nullable: true })
  renewed_date: Date;
}
