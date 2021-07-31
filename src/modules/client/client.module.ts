import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GisModule } from '../gis/gis.module';
import { UsersModule } from '../users/users.module';
import { LocationsController } from './controllers/locations.controller';
import { ClientLocationsEntity } from './entities/locations.entity';
import { LocationsService } from './services/locations.service';

@Module({
  controllers: [LocationsController],
  imports: [
    TypeOrmModule.forFeature([ClientLocationsEntity]),
    GisModule,
    UsersModule,
  ],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class ClientModule {}
