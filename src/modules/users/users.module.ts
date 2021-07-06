import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      TechniccianEntity,
      AgentsEntity,
      HabilitiesEntity,
      ProvincesEntity,
      MunicialitiesEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
