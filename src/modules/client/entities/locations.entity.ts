import { MunicialitiesEntity } from 'src/modules/enums/entities/municipalities.entity';
import { ProvincesEntity } from 'src/modules/enums/entities/provinces.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  schema: 'mod_clients',
  name: 'locations',
})
export class ClientLocationsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  geom: any;

  @ManyToOne(() => ProvincesEntity)
  @JoinColumn({ name: 'provinces' })
  @Index()
  province: ProvincesEntity;

  @ManyToOne(() => MunicialitiesEntity)
  @JoinColumn({ name: 'municipality' })
  @Index()
  municipality: MunicialitiesEntity;

  @Column()
  address: string;

  @Column()
  @Index()
  name: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'user' })
  @Index()
  user: UsersEntity;
}
