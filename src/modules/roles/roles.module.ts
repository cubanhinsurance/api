import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './entities/roles.entity';
import { FunctionalitiesEntity } from '../functionalities/entities/functionalities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RolesEntity, FunctionalitiesEntity])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
