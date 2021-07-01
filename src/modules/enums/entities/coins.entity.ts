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
  name: 'coins',
})
export class CoinsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 1 })
  factor: number;

  @Column({ default: true })
  active: boolean;
}
