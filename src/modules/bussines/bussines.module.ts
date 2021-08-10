import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientModule } from '../client/client.module';
import { CoinsEntity } from '../enums/entities/coins.entity';
import { IssuesTypesEntity } from '../enums/entities/issues_types.entity';
import { LicensesTypesEntity } from '../enums/entities/licenses_types.entity';
import { PayGatewaysEntity } from '../enums/entities/pay_gateways.entity';
import { EnumsModule } from '../enums/enums.module';
import { GisModule } from '../gis/gis.module';
import { IoModule } from '../io/io.module';
import { UsersModule } from '../users/users.module';
import { IssuesController } from './controllers/issues.controller';
import { LicensesController } from './controllers/licenses.controller';
import { IssuesEntity, IssuesTraces } from './entities/issues.entity';
import { LicensesEntity } from './entities/licenses.entity';
import { RatingsEntity } from './entities/ratings.entity';
import { TechApplicantEntity } from './entities/tech_applicant.entity';
import { TransactionsEntity } from './entities/transactions.entity';
import { UserLicensesEntity } from './entities/user_licenses.entity';
import { IssuesService } from './services/issues.service';
import { LicensesService } from './services/licenses.service';
import { LicensesTypesService } from './services/licenses_types.service';

@Module({
  imports: [
    UsersModule,
    IoModule,
    ClientModule,
    EnumsModule,
    GisModule,
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
      IssuesEntity,
    ]),
  ],
  controllers: [LicensesController, IssuesController],
  providers: [LicensesService, LicensesTypesService, IssuesService],
  exports: [LicensesService, LicensesTypesService, IssuesService],
})
export class BussinesModule {}
