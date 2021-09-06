import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GisService } from 'src/modules/gis/services/gis.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { Repository } from 'typeorm';
import { ClientLocationsEntity } from '../entities/locations.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(ClientLocationsEntity)
    private cliensLocationsRepo: Repository<ClientLocationsEntity>,
    private gisService: GisService,
    private usersService: UsersService,
  ) {}

  async createLocation(
    username: string,
    {
      name,
      geom: {
        geometry: {
          coordinates: [x, y],
        },
      },
      address,
    }: {
      geom: any;
      name;
      address: string;
    },
  ) {
    const user = await this.usersService.findUserByUserName(
      username,
      null,
      true,
    );

    const existsName = await this.cliensLocationsRepo
      .createQueryBuilder('l')
      .innerJoin('l.user', 'u')
      .where('u.username=:username and l.name=:name', { username, name })
      .getOne();

    if (!!existsName)
      throw new ConflictException(
        `Ya existe una ubicación de ese usuario con ese nombre`,
      );

    const { province, municipality } = await this.gisService.whereis(x, y);

    const added = await this.cliensLocationsRepo
      .createQueryBuilder('l')
      .insert()
      .values({
        name,
        address,
        province,
        municipality,
        user,
        geom: () => `st_setsrid(st_point(${x},${y}),4326)`,
      })
      .execute();

    const a = 6;
  }

  async updateLocation(
    username: string,
    id: number,
    { geom, address, name }: { geom?: any; name?: string; address?: string },
  ) {
    const location = await this.cliensLocationsRepo
      .createQueryBuilder('l')
      .innerJoin('l.user', 'u')
      .where('u.username=:username and l.id=:id', { id, username })
      .getOne();

    if (!location) throw new NotFoundException();

    if (address !== undefined) location.address = address;
    if (name !== undefined) location.name = name;
    if (geom !== undefined) {
      const {
        geometry: {
          coordinates: [x, y],
        },
      } = geom;
      const { province, municipality } = await this.gisService.whereis(x, y);
      location.geom = () => `st_setsrid(st_point(${x},${y}),4326)`;
      location.province = province;
      location.municipality = municipality as any;
    }

    const updated = await this.cliensLocationsRepo
      .createQueryBuilder('l')
      .update(location)
      .execute();
  }

  async removeUserLocation(username: string, id: number) {
    const location = await this.cliensLocationsRepo
      .createQueryBuilder('l')
      .select(['l.id'])
      .innerJoin('l.user', 'u')
      .where('u.username=:username and l.id=:id', { id, username })
      .getOne();

    if (!location) throw new NotFoundException();

    const deleted = await this.cliensLocationsRepo.softDelete(location);
  }

  async getUserLocations(username: string) {
    return await this.cliensLocationsRepo
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.province', 'province')
      .innerJoinAndSelect('c.municipality', 'municipality')
      .innerJoin('c.user', 'user')
      .where('user.username=:username', { username })
      .getMany();
  }

  async getLocation(username: string, location: number) {
    return await this.cliensLocationsRepo
      .createQueryBuilder('l')
      .innerJoin('l.user', 'u')
      .innerJoinAndSelect('l.province', 'province')
      .innerJoinAndSelect('l.municipality', 'municipality')
      .where(`u.username=username and l.id=:location`, { username, location })
      .getOne();
  }
}
