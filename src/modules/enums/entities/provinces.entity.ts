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
  name: 'provinces',
  orderBy: {
    code: 'ASC',
  },
})
export class ProvincesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  short_name: string;

  @Column({ nullable: true })
  code: string;

  @ManyToOne(() => CountriesEntity)
  @JoinColumn({ name: 'country' })
  country: CountriesEntity;

  @Column({
    select: false,
    type: 'geometry',
    srid: 4326,
    spatialFeatureType: 'MultiPolygon',
    nullable: true,
  })
  @Index({ spatial: true })
  geom: string;
}
