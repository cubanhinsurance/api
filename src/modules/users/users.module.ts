import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabilitiesEntity } from '../enums/entities/habilities.entity';
import { UsersController } from './controllers/users.controllers';
import { AgentsEntity } from './entities/agent.entity';
import { TechniccianEntity } from './entities/techniccian.entity';
import { UsersEntity } from './entities/user.entity';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      TechniccianEntity,
      AgentsEntity,
      HabilitiesEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
