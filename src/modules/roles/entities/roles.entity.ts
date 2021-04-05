import { FunctionalitiesEntity } from 'src/modules/functionalities/entities/functionalities.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity({
  name: 'roles',
  schema: 'mod_security',
})
export class RolesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => FunctionalitiesEntity)
  @JoinTable()
  functionalities: FunctionalitiesEntity[];

  @Column({ default: false })
  root: boolean;
}
