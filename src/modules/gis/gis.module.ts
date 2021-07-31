/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MunicialitiesEntity } from '../enums/entities/municipalities.entity';
import { ProvincesEntity } from '../enums/entities/provinces.entity';
import { GisController } from './controllers/gis.controller';
import { GisService } from './services/gis.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProvincesEntity, MunicialitiesEntity])],
  controllers: [GisController],
  providers: [GisService],
  exports: [GisService],
})
export class GisModule {}
