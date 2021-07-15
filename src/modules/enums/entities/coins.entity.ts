import { TransactionsEntity } from 'src/modules/bussines/entities/transactions.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { CountriesEntity } from './countries.entity';

@Entity({
  schema: 'mod_enums',
  name: 'coins',
})
export class CoinsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 1 })
  factor: number;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => TransactionsEntity, (t) => t.coin)
  transactions: TransactionsEntity[];

  @DeleteDateColumn()
  deleted_at: Date;
}
