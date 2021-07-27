import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabilitiesEntity } from '../enums/entities/habilities.entity';
import { MunicialitiesEntity } from '../enums/entities/municipalities.entity';
import { ProvincesEntity } from '../enums/entities/provinces.entity';
import { UsersController } from './controllers/users.controllers';
import { AgentsEntity } from './entities/agent.entity';
import { TechniccianEntity } from './entities/techniccian.entity';
import { UsersEntity } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { APP_MAIL_MODULE } from '../../common/mailer.module';
import { TechApplicantEntity } from '../bussines/entities/tech_applicant.entity';
import { TechApplicationsService } from './services/tech_applications.service';
import { REDIS_BROKER } from 'src/lib/microservice/broker';
import { RedisCacheModule } from 'src/lib/cache/redis';

@Module({
  imports: [
    REDIS_BROKER,
    TypeOrmModule.forFeature([
      UsersEntity,
      TechniccianEntity,
      AgentsEntity,
      HabilitiesEntity,
      ProvincesEntity,
      MunicialitiesEntity,
      TechApplicantEntity,
    ]),
    RedisCacheModule('redis'),
  ],
  controllers: [UsersController],
  providers: [UsersService, TechApplicationsService],
  exports: [UsersService, TechApplicationsService],
})
export class UsersModule {}
