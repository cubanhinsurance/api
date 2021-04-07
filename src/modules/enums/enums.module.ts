import { EnumsController } from './controllers/enums.controller';
import { EnumsService } from './services/enums.service';
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
  controllers: [EnumsController],
  providers: [EnumsService],
})
export class EnumsModule {}
