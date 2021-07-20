import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinsEntity } from '../enums/entities/coins.entity';
import { IssuesTypesEntity } from '../enums/entities/issues_types.entity';
import { LicensesTypesEntity } from '../enums/entities/licenses_types.entity';
import { PayGatewaysEntity } from '../enums/entities/pay_gateways.entity';
import { UsersModule } from '../users/users.module';
import { LicensesController } from './controllers/licenses.controller';
import { IssuesTraces } from './entities/issues.entity';
import { LicensesEntity } from './entities/licenses.entity';
import { RatingsEntity } from './entities/ratings.entity';
import { TechApplicantEntity } from './entities/tech_applicant.entity';
import { TransactionsEntity } from './entities/transactions.entity';
import { UserLicensesEntity } from './entities/user_licenses.entity';
import { LicensesService } from './services/licenses.service';
import { LicensesTypesService } from './services/licenses_types.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      TechApplicantEntity,
      LicensesEntity,
      TransactionsEntity,
      UserLicensesEntity,
      RatingsEntity,
      IssuesTypesEntity,
      IssuesTraces,
      LicensesTypesEntity,
      CoinsEntity,
      PayGatewaysEntity,
    ]),
  ],
  controllers: [LicensesController],
  providers: [LicensesService, LicensesTypesService],
  exports: [LicensesService, LicensesTypesService],
})
export class BussinesModule {}
