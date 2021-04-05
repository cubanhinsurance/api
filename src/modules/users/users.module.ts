import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controllers';
import { AgentsEntity } from './entities/agent.entity';
import { TechniccianEntity } from './entities/techniccian.entity';
import { UsersEntity } from './entities/user.entity';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, TechniccianEntity, AgentsEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
