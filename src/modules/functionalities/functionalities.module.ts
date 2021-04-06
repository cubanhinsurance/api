import { FunctionalitiesService } from './services/functionalities.service';
import { FunctionalitiesController } from './controller/functionalities.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionalitiesEntity } from './entities/functionalities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FunctionalitiesEntity])],
  controllers: [FunctionalitiesController],
  providers: [FunctionalitiesService],
})
export class FunctionalitiesModule {}
