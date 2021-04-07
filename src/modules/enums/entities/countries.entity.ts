import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  schema: 'mod_enums',
  name: 'countries',
})
export class CountriesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  short_name: string;

  @Column({ nullable: true })
  code: string;

  @Column({
    type: 'geometry',
    srid: 4326,
    spatialFeatureType: 'MultiPolygon',
    nullable: true,
  })
  geom: string;
}
