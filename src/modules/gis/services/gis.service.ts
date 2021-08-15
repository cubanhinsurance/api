import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { MunicialitiesEntity } from 'src/modules/enums/entities/municipalities.entity';
import { ProvincesEntity } from 'src/modules/enums/entities/provinces.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class GisService implements OnModuleInit {
  private municipalitiesCache: Map<number, any>;
  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(ProvincesEntity)
    private provincesRepo: Repository<ProvincesEntity>,
    @InjectRepository(MunicialitiesEntity)
    private muncsRepo: Repository<MunicialitiesEntity>,
  ) {
    this.municipalitiesCache = new Map<number, any>();
  }

  async onModuleInit() {
    Logger.log('Loading municipalities cache ...', 'GisService');
    const muncs = await this.muncsRepo
      .createQueryBuilder('m')
      .select(['m.id'])
      .addSelect('st_asgeojson(st_centroid(m.geom))', 'centroid')
      .getRawMany();

    for (const { m_id, centroid } of muncs) {
      this.municipalitiesCache.set(m_id, JSON.parse(centroid));
    }

    Logger.log('Municipalities cache loaded !!!', 'GisService');

    const b = 7;
  }

  async whereis(x: number, y: number) {
    const response = await this.muncsRepo
      .createQueryBuilder('m')
      .innerJoin('m.province', 'prov')
      .addSelect(['prov.id', 'prov.name'])
      .where(`st_intersects(m.geom,st_setsrid(st_point(:x,:y),4326))`, { x, y })
      .getOne();

    if (!response)
      throw new BadRequestException(
        'La coordenada no se encuentra en ningun municipio',
      );

    return {
      province: response.province,
      municipality: {
        id: response.id,
        name: response.name,
      },
    };
  }

  async zoomto({
    municipalities,
    provinces,
    municipality,
    province,
  }: {
    province?: number;
    municipality?: number;
    provinces?: number[];
    municipalities?: number[];
  }) {
    if (municipality !== undefined) {
      try {
        const { extent } = await this.muncsRepo
          .createQueryBuilder('m')
          .select('st_asgeojson(st_envelope(m.geom))', 'extent')
          .where('m.id=:municipality', { municipality })
          .groupBy('m.code,m.geom')
          .getRawOne();
        return extent;
      } catch (e) {
        throw new NotFoundException();
      }
    }

    if (province !== undefined) {
      try {
        const { extent } = await this.provincesRepo
          .createQueryBuilder('p')
          .select('st_asgeojson(st_envelope(p.geom))', 'extent')
          .where('p.id=:province', { province })
          .groupBy('p.code,p.geom')
          .getRawOne();
        return extent;
      } catch (e) {
        throw new NotFoundException();
      }
    }
  }

  getMunicipalityCentroid(id: number) {
    return this.municipalitiesCache.get(id);
  }
}
