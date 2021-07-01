import { EnumsController } from './controllers/enums.controller';
import { EnumsService } from './services/enums.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesEntity } from './entities/countries.entity';
import { MunicialitiesEntity } from './entities/municipalities.entity';
import { ProvincesEntity } from './entities/provinces.entity';
import { HabilitiesEntity } from './entities/habilities.entity';
import { HabilitiesGroupsEntity } from './entities/habilities_groups.entity';
import { HabilitiesRequirementsEntity } from './entities/habilities_reqs.entity';
import { MulterModule } from '@nestjs/platform-express';
import { IssuesTypesEntity } from './entities/issues_types.entity';
import { IssuesStatesEntity } from './entities/issues_states.entity';
import { CoinsEntity } from './entities/coins.entity';
import { TransactionsTypesEntity } from './entities/transactions_types.entity';
import { PayGatewaysEntity } from './entities/pay_gateways.entity';
import { LicensesTypesEntity } from './entities/licenses_types.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CountriesEntity,
      ProvincesEntity,
      MunicialitiesEntity,
      HabilitiesEntity,
      HabilitiesGroupsEntity,
      HabilitiesRequirementsEntity,
      IssuesTypesEntity,
      IssuesStatesEntity,
      CoinsEntity,
      TransactionsTypesEntity,
      PayGatewaysEntity,
      LicensesTypesEntity,
    ]),
  ],
  controllers: [EnumsController],
  providers: [EnumsService],
})
export class EnumsModule {}
