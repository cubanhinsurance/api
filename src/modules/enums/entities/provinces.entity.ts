import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({
  schema: 'mod_enums',
  name: 'provinces',
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

  @ManyToOne(() => ProvincesEntity)
  @JoinColumn({ name: 'province' })
  province: ProvincesEntity;

  @Column({
    type: 'geometry',
    srid: 4326,
    spatialFeatureType: 'MultiPolygon',
    nullable: true,
  })
  @Index()
  geom: string;
}
