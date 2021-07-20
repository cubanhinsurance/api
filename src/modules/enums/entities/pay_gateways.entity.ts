import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountriesEntity } from './countries.entity';

@Entity({
  schema: 'mod_enums',
  name: 'pay_gateways',
})
export class PayGatewaysEntity {
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
  avatar: string;
}
