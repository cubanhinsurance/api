import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesEntity } from './entities/countries.entity';
import { MunicialitiesEntity } from './entities/municipalities.entity';
import { ProvincesEntity } from './entities/provinces.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CountriesEntity,
      ProvincesEntity,
      MunicialitiesEntity,
    ]),
  ],
  controllers: [],
  providers: [],
})
export class EnumsModule {}
