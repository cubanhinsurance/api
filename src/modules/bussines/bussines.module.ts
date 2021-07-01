import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicensesEntity } from './entities/licenses.entity';
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
    ]),
  ],
})
export class BussinesModule {}
