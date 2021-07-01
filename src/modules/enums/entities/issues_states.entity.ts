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
  name: 'issues_states',
})
export class IssuesStatesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
