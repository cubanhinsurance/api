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

@Entity({
  schema: 'mod_bussines',
  name: 'licenses',
})
export class LicensesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LicensesTypesEntity)
  @JoinColumn({ name: 'type' })
  @Index()
  type: LicensesTypesEntity;

  @Column({ default: true })
  @Index()
  active: boolean;

  @Column({ nullable: true })
  @Index()
  expiration_date: Date;

  @Column({
    type: 'jsonb',
    default: {},
  })
  config: object;
}
