import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { MunicialitiesEntity } from 'src/modules/enums/entities/municipalities.entity';
import { ProvincesEntity } from 'src/modules/enums/entities/provinces.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from './user.entity';

@Entity({ schema: 'mod_users', name: 'techniccians' })
export class TechniccianEntity {
  @PrimaryColumn({ type: 'integer', nullable: false })
  @OneToOne(() => UsersEntity)
  @JoinColumn({ name: 'user' })
  user: UsersEntity;

  @Column({ nullable: true })
  expiration_date: Date;

  @Column({ default: true })
  active: boolean;

  @ManyToMany(() => HabilitiesEntity)
  @JoinTable()
  habilities: HabilitiesEntity[];

  @Column({ default: false })
  confirmed: boolean;

  @Column({ nullable: true })
  confirmation_photo: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  ci: string;

  @ManyToOne(() => ProvincesEntity, { nullable: true })
  @JoinColumn({ name: 'province' })
  province: ProvincesEntity;

  @ManyToOne(() => MunicialitiesEntity, { nullable: true })
  @JoinColumn({ name: 'municipality' })
  municipality: MunicialitiesEntity;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
