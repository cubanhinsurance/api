import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinsEntity } from '../enums/entities/coins.entity';
import { IssuesTypesEntity } from '../enums/entities/issues_types.entity';
import { LicensesTypesEntity } from '../enums/entities/licenses_types.entity';
import { LicensesController } from './controllers/licenses.controller';
import { IssuesTraces } from './entities/issues.entity';
import { LicensesEntity } from './entities/licenses.entity';
import { RatingsEntity } from './entities/ratings.entity';
import { TechApplicantEntity } from './entities/tech_applicant.entity';
import { TransactionsEntity } from './entities/transactions.entity';
import { UserLicensesEntity } from './entities/user_licenses.entity';
import { LicensesService } from './services/licenses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TechApplicantEntity,
      LicensesEntity,
      TransactionsEntity,
      UserLicensesEntity,
      RatingsEntity,
      IssuesTypesEntity,
      IssuesTraces,
      LicensesTypesEntity,
      CoinsEntity
    ]),
  ],
  controllers: [LicensesController],
  providers: [LicensesService],
  exports: [LicensesService],
})
export class BussinesModule {}
