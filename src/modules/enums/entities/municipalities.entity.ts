import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity({
  schema: 'mod_enums',
  name: 'municipalities',
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

  @ManyToOne(() => MunicialitiesEntity)
  @JoinColumn({ name: 'municipality' })
  municipality: MunicialitiesEntity;

  @Column({
    type: 'geometry',
    srid: 4326,
    spatialFeatureType: 'MultiPolygon',
    nullable: true,
  })
  @Index()
  geom: string;
}
