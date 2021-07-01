import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientLocationsEntity } from './entities/locations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientLocationsEntity])],
})
export class ClientModule {}
