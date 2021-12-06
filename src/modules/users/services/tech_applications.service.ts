import {
  CacheStore,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, paginate_qr, skip } from 'src/lib/pagination.results';
import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { MunicialitiesEntity } from 'src/modules/enums/entities/municipalities.entity';
import { ProvincesEntity } from 'src/modules/enums/entities/provinces.entity';
import {
  TECH_APPLICANT,
  TECH_APPLICANT_CANCELLED,
  TECH_APPLICANT_CONFIRMED,
} from 'src/modules/bussines/io.constants';
import { In, IsNull, Repository } from 'typeorm';
import { TechApplicantEntity } from '../../bussines/entities/tech_applicant.entity';
import { TechDto } from '../dtos/user.dto';
import { AgentsEntity } from '../entities/agent.entity';
import { TechniccianEntity } from '../entities/techniccian.entity';
import { UsersEntity } from '../entities/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class TechApplicationsService implements OnModuleInit {
  constructor(
    @Inject('BROKER') private broker: ClientProxy,
    @InjectRepository(TechApplicantEntity)
    private techApplicantRepo: Repository<TechApplicantEntity>,
    @InjectRepository(ProvincesEntity)
    private provinces: Repository<ProvincesEntity>,
    @InjectRepository(MunicialitiesEntity)
    private municipalities: Repository<MunicialitiesEntity>,
    @InjectRepository(HabilitiesEntity)
    private habilitiesEntity: Repository<HabilitiesEntity>,
    @InjectRepository(TechniccianEntity)
    private technicciansEntity: Repository<TechniccianEntity>,

    @InjectRepository(AgentsEntity)
    private agentsEntity: Repository<AgentsEntity>,
    private usersService: UsersService,
    @Inject('CACHE_MANAGER') private cache: CacheStore,
  ) {}

  async onModuleInit() {}

  async getApplicants(page: number | null, page_size: number = 10) {
    const qr = this.techApplicantRepo
      .createQueryBuilder('t')
      .select(['t.id', 't.ci', 't.date'])
      .innerJoin('t.user', 'u')
      .addSelect(['u.username', 'u.name', 'u.lastname'])
      .leftJoin('u.techniccian_info', 'tech')
      .addSelect(['tech.active', 'tech.user'])
      .innerJoin('t.province', 'prov')
      .addSelect(['prov.id', 'prov.name'])
      .innerJoin('t.municipality', 'munc')
      .addSelect(['munc.id', 'munc.name'])
      .where('t.approved isnull');

    if (page !== null) {
      qr.take(page_size).skip(skip(page, page_size));
    }

    const [rows, total] = await qr.getManyAndCount();

    return paginate(rows, page, page_size, total);
  }

  async getApplicantsCount() {
    return await this.techApplicantRepo.count({
      where: {
        approved: IsNull(),
      },
    });
  }

  async confirmTechApplication(
    username: string,
    id: number,
    confirm: boolean,
    description?: string,
  ) {
    const application = await this.techApplicantRepo.findOne({
      relations: [
        'user',
        'user.techniccian_info',
        'province',
        'municipality',
        'habilities',
      ],
      where: {
        id,
        approved: IsNull(),
      },
    });

    if (!application) throw new NotFoundException();

    //todo hay q ver esi esto se queda
    application.confirmation_photo = '';

    const agent = await this.agentsEntity
      .createQueryBuilder('a')
      .innerJoin('a.user', 'u')
      .addSelect(['u.name', 'u.username', 'u.lastname'])
      .where('u.username=:username', { username })
      .getOne();

    if (!agent) throw new ForbiddenException();

    application.agent = agent;
    application.approved = confirm;
    application.response_date = new Date();
    application.description = description;

    try {
      await this.techApplicantRepo.save(application);

      if (confirm) {
        if (application.user.techniccian_info) {
          const tech_info = await this.technicciansEntity
            .createQueryBuilder('t')
            .innerJoin('t.user', 'u')
            .addSelect(['u.username', 'u.id'])
            .where('u.username=:username', { username })
            .getOne();

          if (application.province) tech_info.province = application.province;
          if (application.municipality)
            tech_info.municipality = application.municipality;
          if (application.address) tech_info.address = application.address;
          if (application.habilities)
            tech_info.habilities = application.habilities;

          await this.technicciansEntity.save(tech_info);
        } else {
          const created = await this.technicciansEntity.save({
            address: application.address,
            ci: application.ci,
            active: true,
            confirmed: true,
            habilities: application.habilities,
            province: application.province,
            municipality: application.municipality,
            user: application.user,
          });
        }
      }

      this.broker.emit(TECH_APPLICANT_CONFIRMED, {
        username,
        approved: confirm,
        description,
        agent,
        date: application.response_date,
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async cancelTechApplication(username: string, id: number) {
    const application = await this.techApplicantRepo.findOne({
      relations: ['user'],
      where: {
        id,
        approved: IsNull(),
      },
    });

    if (!application) throw new NotFoundException();

    if (application.user.username != username) throw new ForbiddenException();

    try {
      await this.techApplicantRepo.softDelete(application);

      this.broker.emit(TECH_APPLICANT_CANCELLED, {
        ...application,
        user: await this.usersService.getUserPrivateData(username),
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async getUserLatestApplication(username: string) {
    try {
      return await this.techApplicantRepo
        .createQueryBuilder('t')
        .select(['t.address', 't.ci', 't.date', 't.id'])
        .innerJoin('t.user', 'u')
        .innerJoinAndSelect('t.habilities', 'h')
        .innerJoinAndSelect('h.group', 'hg')
        .innerJoin('t.province', 'prov')
        .addSelect(['prov.id', 'prov.name'])
        .innerJoin('t.municipality', 'munc')
        .addSelect(['munc.id', 'munc.name'])
        .where('u.username=:username and t.approved isnull ', { username })
        .orderBy('t.id', 'DESC')
        .getOne();
    } catch (e) {
      const a = 7;
    }
  }

  async cancelapplication(applicant: number) {}

  async getApplicantInfo(applicant: number) {
    return await this.techApplicantRepo
      .createQueryBuilder('t')
      .innerJoin('t.user', 'u')
      .addSelect([
        'u.username',
        'u.name',
        'u.lastname',
        'u.active',
        'u.email',
        'u.expiration_date',
        'u.id',
        'u.phone_number',
        'u.photo',
        'u.telegram_id',
      ])

      .innerJoinAndSelect('t.habilities', 'h')
      .innerJoinAndSelect('h.group', 'hg')
      .leftJoin('u.techniccian_info', 'tech')
      .addSelect(['tech.active', 'tech.user', 'tech.address'])

      .leftJoin('tech.province', 'tprov')
      .addSelect(['tprov.id', 'tprov.name'])
      .leftJoin('tech.municipality', 'tmunc')
      .addSelect(['tmunc.id', 'tmunc.name'])

      .innerJoin('t.province', 'prov')
      .addSelect(['prov.id', 'prov.name'])
      .innerJoin('t.municipality', 'munc')
      .addSelect(['munc.id', 'munc.name'])
      .where('t.id=:applicant', { applicant })
      .getOne();
  }

  async createApplicant({
    username,
    address,
    ci,
    habilities: habilities_ids,
    province,
    municipality,
    confirmation_photo,
    phone_number,
  }: {
    username: string;
    address?: string;
    phone_number?: string;
    ci?: string;
    province?: string;
    municipality?: string;
    confirmation_photo?: Buffer;
    habilities?: number[];
  }) {
    let userData = await this.usersService.findUserByUserName(username);

    if (!userData) throw new NotFoundException(`Usuario no existe`);

    const activeApplication = await this.techApplicantRepo.findOne({
      where: {
        user: userData,
        approved: IsNull(),
      },
    });

    if (activeApplication)
      throw new ForbiddenException(
        `El usuario ya tiene una solicitud en proceso, debe esperar a que se apruebe/deniegue para realizar otra`,
      );

    if (typeof phone_number != 'undefined') {
      const updated = await this.usersService.updateUser(username, {
        phone_number,
      });
      userData = await this.usersService.findUserByUserName(username);
    }

    if (!userData.phone_number)
      throw new ForbiddenException(
        'El usuario no tiene un numero de telefono configurado',
      );

    const techinfo = userData.techniccian_info
      ? await this.technicciansEntity.findOne({
          relations: ['province', 'municipality', 'habilities'],
          where: {
            user: userData,
          },
        })
      : null;

    const p =
      techinfo && province == undefined
        ? techinfo.province
        : await this.provinces.findOne(province);
    if (!p) throw new NotFoundException('No existe la provincia');

    const m =
      techinfo && municipality == undefined
        ? techinfo.municipality
        : await this.municipalities.findOne(municipality);
    if (!m) throw new NotFoundException('No existe el municipio');

    let habilities =
      techinfo && habilities_ids == undefined
        ? techinfo.habilities
        : await this.habilitiesEntity.find({
            where: { id: In(habilities_ids) },
          });

    if (habilities_ids && habilities.length != habilities_ids.length) {
      throw new NotFoundException(`
        No se encontraron las habilidades:
        ${habilities_ids
          .filter((h_id) => !habilities.find((h) => h.id == h_id))
          .join(',')}
      `);
    }

    const techApp = await this.techApplicantRepo.save({
      habilities,
      address,
      ci,
      confirmation_photo: (confirmation_photo as any).toString('base64'),
      date: new Date(),
      province: p,
      municipality: m,
      user: userData,
    });

    this.broker.emit(TECH_APPLICANT, {
      ...techApp,
      user: await this.usersService.getUserPrivateData(username),
    });
  }

  async getUserApplications(
    username: string,
    page: number,
    page_size: number = 10,
  ) {
    return await paginate_qr(
      page,
      page_size,
      this.techApplicantRepo
        .createQueryBuilder('app')
        .innerJoinAndSelect('app.habilities', 'habilities')
        .innerJoinAndSelect('habilities.group', 'hgroup')
        .innerJoin('app.province', 'prov')
        .addSelect(['prov.id', 'prov.name'])
        .innerJoin('app.municipality', 'munc')
        .addSelect(['munc.id', 'munc.name'])
        .leftJoin('app.agent', 'agent')
        .leftJoin('agent.user', 'user')
        .addSelect([
          'user.id',
          'user.name',
          'user.lastname',
          'user.email',
          'user.username',
        ])
        .innerJoin('app.user', 'appuser')
        .where(`appuser.username=:username`, { username }),
    );
  }
}
