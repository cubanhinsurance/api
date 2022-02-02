import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REDIS_BROKER } from 'src/lib/microservice/broker';
import { ClientModule } from '../client/client.module';
import { CoinsEntity } from '../enums/entities/coins.entity';
import { IssuesTypesEntity } from '../enums/entities/issues_types.entity';
import { LicensesTypesEntity } from '../enums/entities/licenses_types.entity';
import { PayGatewaysEntity } from '../enums/entities/pay_gateways.entity';
import { EnumsModule } from '../enums/enums.module';
import { GisModule } from '../gis/gis.module';
import { OsrmModule } from '../osrm/src/osrm.module';
import { UsersModule } from '../users/users.module';
import { IssuesController } from './controllers/issues.controller';
import { LicensesController } from './controllers/licenses.controller';
import { IgnoredIssuesEntity } from './entities/ignored_issues.entity';
import { IssuesEntity, IssuesTraces } from './entities/issues.entity';
import { IssueApplication } from './entities/issues_applications.entity';
import { LicensesEntity } from './entities/licenses.entity';
import { RatingsEntity } from './entities/ratings.entity';
import { TechApplicantEntity } from './entities/tech_applicant.entity';
import { TransactionsEntity } from './entities/transactions.entity';
import { UserLicensesEntity } from './entities/user_licenses.entity';
import { IssuesService } from './services/issues.service';
import { IssuesCacheService } from './services/issues_cache.service';
import { LicensesService } from './services/licenses.service';
import { LicensesTypesService } from './services/licenses_types.service';
import { directory } from './filesdir';

@Module({
  imports: [
    REDIS_BROKER,
    UsersModule,
    ClientModule,
    EnumsModule,
    GisModule,
    MulterModule.registerAsync({
      useFactory: async () => {
        return {
          limits: {
            fileSize: 10000000,
            files: 10,
          },
          dest: await directory(),
        };
      },
    }),
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
      IssueApplication,
      IgnoredIssuesEntity,
    ]),
  ],
  controllers: [LicensesController, IssuesController],
  providers: [
    LicensesService,
    LicensesTypesService,
    IssuesService,
    IssuesCacheService,
  ],
  exports: [
    LicensesService,
    LicensesTypesService,
    IssuesService,
    IssuesCacheService,
  ],
})
export class BussinesModule {}
