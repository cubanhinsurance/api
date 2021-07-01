import { CoinsEntity } from 'src/modules/enums/entities/coins.entity';
import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { MunicialitiesEntity } from 'src/modules/enums/entities/municipalities.entity';
import { PayGatewaysEntity } from 'src/modules/enums/entities/pay_gateways.entity';
import { ProvincesEntity } from 'src/modules/enums/entities/provinces.entity';
import { TransactionsTypesEntity } from 'src/modules/enums/entities/transactions_types.entity';
import { AgentsEntity } from 'src/modules/users/entities/agent.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TRANSACTION_STATE {
  COMPLETED = 'completed',
  PENDENT = 'pendent',
  FAILED = 'failed',
}

@Entity({
  schema: 'mod_bussines',
  name: 'transactions',
})
export class TransactionsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity, { nullable: true })
  @JoinColumn({ name: 'from' })
  @Index()
  from: UsersEntity;

  @ManyToOne(() => UsersEntity, { nullable: true })
  @JoinColumn({ name: 'to' })
  @Index()
  to: UsersEntity;

  @Column()
  amount: number;

  @ManyToOne(() => TransactionsTypesEntity)
  @JoinColumn({ name: 'type' })
  @Index()
  type: TransactionsTypesEntity;

  @ManyToOne(() => CoinsEntity)
  @JoinColumn({ name: 'coin' })
  @Index()
  coin: CoinsEntity;

  @Column()
  @Index()
  date: Date;

  @Column()
  @Index()
  state: TRANSACTION_STATE;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => PayGatewaysEntity)
  @JoinColumn({ name: 'gateway' })
  @Index()
  gateway: PayGatewaysEntity;

  @Column()
  @Index()
  transaction_id: string;
}
