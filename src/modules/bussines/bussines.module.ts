import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuesTypesEntity } from '../enums/entities/issues_types.entity';
import { IssuesTraces } from './entities/issues.entity';
import { LicensesEntity } from './entities/licenses.entity';
import { RatingsEntity } from './entities/ratings.entity';
import { TechApplicantEntity } from './entities/tech_applicant.entity';
import { TransactionsEntity } from './entities/transactions.entity';
import { UserLicensesEntity } from './entities/user_licenses.entity';

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
    ]),
  ],
})
export class BussinesModule {}
