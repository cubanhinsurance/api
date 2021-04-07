import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { ProvincesEntity } from './provinces.entity';

@Entity({
  schema: 'mod_enums',
  name: 'municipalities',
  orderBy: {
    code: 'ASC',
  },
})
export class MunicialitiesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  short_name: string;

  @Column({ nullable: true })
  code: string;

  @ManyToOne(() => ProvincesEntity)
  @JoinColumn({ name: 'province' })
  province: ProvincesEntity;

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
