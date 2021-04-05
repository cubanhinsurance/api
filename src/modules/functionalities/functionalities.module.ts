import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionalitiesEntity } from './entities/functionalities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FunctionalitiesEntity])],
  controllers: [],
  providers: [],
})
export class FunctionalitiesModule {}
