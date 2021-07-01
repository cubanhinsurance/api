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
  name: 'transactions_types',
})
export class TransactionsTypesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
