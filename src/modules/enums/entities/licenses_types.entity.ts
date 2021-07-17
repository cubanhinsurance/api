import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { CountriesEntity } from './countries.entity';

@Entity({
  schema: 'mod_enums',
  name: 'licenses_types',
})
export class LicensesTypesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'jsonb',
    default: {},
  })
  config: object;

  @Column({ nullable: true })
  description: string;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;
}
