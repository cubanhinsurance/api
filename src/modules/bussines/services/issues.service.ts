import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { array, boolean, number, object, string } from 'joi';
import { findOrFail } from 'src/lib/typeorm/id_colection_handler';
import { LocationsController } from 'src/modules/client/controllers/locations.controller';
import { LocationsService } from 'src/modules/client/services/locations.service';
import { IssuesTypesEntity } from 'src/modules/enums/entities/issues_types.entity';
import { EnumsService } from 'src/modules/enums/services/enums.service';
import {
  ISSUE_CREATED,
  NEW_ISSUE_APPLICATION,
} from 'src/modules/bussines/io.constants';
import { UsersService } from 'src/modules/users/services/users.service';
import { FindConditions, Repository, SelectQueryBuilder } from 'typeorm';
import { IssuesEntity, ISSUE_STATE } from '../entities/issues.entity';
import {
  IssueApplication,
  ISSUE_APPLICATION_STATE,
} from '../entities/issues_applications.entity';
import { paginate_qr } from 'src/lib/pagination.results';

const updateQb = (qb: SelectQueryBuilder<IssuesEntity>): void => {};

@Injectable()
export class IssuesService implements OnModuleInit {
  constructor(
    @InjectRepository(IssuesEntity)
    private issuesRepo: Repository<IssuesEntity>,
    @InjectRepository(IssueApplication)
    private issuesAppRepo: Repository<IssueApplication>,
    @Inject('BROKER') private broker: ClientProxy,
    private usersService: UsersService,
    private locationsService: LocationsService,
    private enumsService: EnumsService,
  ) {}

  async addIssue(
    username: string,
    location: number,
    {
      type,
      description,
      maxDistance = 100000,
      date,
      expiration_date,
      max = 100,
      scheduled,
      scheduled_description,
      data = {},
      photos = [],
    }: {
      type: number;
      scheduled?: boolean;
      scheduled_description?: string;
      date?: Date;
      description?: string;
      expiration_date?: Date;
      max?: number;
      maxDistance?: number;
      data?: object;
      photos?: any[];
    },
  ) {
    const user = await this.usersService.findUserByUserName(username);

    const loc = await this.locationsService.getLocation(username, location);

    if (!loc) throw new NotFoundException('Ubicacion no existe');

    const issue = await this.enumsService.getIssueType(type);

    if (!issue) throw new NotFoundException('Tipo de incidencia no existe');

    let questionsSchema = {};

    if (issue.questions?.length > 0) {
      issue.questions.forEach(({ question, required, options, type }, i) => {
        let q;
        switch (type) {
          case 'string':
            q = string();
            break;
          case 'options':
            q = array().items(...options);
            break;
          case 'boolean':
            q = boolean();
            break;
          case 'number':
            q = number();
            break;
        }

        if (q) {
          if (required) q.required();
          else q.optional();
        }

        questionsSchema[i] = q;
      });
    }

    const schema = object(questionsSchema);

    const { value, error } = await schema.validate(data);
    if (error)
      throw new BadRequestException(`Formulario incorrecto: ${error.message}`);
    data = value;

    try {
      const {
        identifiers: [{ id }],
      } = await this.issuesRepo
        .createQueryBuilder('i')
        .insert()
        .values({
          type: issue,
          date: date ?? new Date(),
          description,
          scheduled,
          scheduled_description,
          state: ISSUE_STATE.CREATED,
          data: data ?? {},
          expiration_date,
          max_distance: maxDistance,
          max_techs: max,
          location: () => `st_geomfromgeojson('${JSON.stringify(loc.geom)}')`,
          client_location: loc,
          user,
        })
        .execute();

      const i = await this.getOpennedIssue(id);

      this.broker.emit(ISSUE_CREATED, i);
    } catch (e) {
      const a = 8;
    }
  }

  async onModuleInit() {
    const opennedIssues = await this.getOpenedIssues();

    for (const i of opennedIssues) {
      this.broker.emit(ISSUE_CREATED, i);
    }
  }

  async getOpennedIssue(id: number) {
    return await this.getIssueFromDb(id, (qb) => {
      qb.andWhere('i.state=:state', { state: ISSUE_STATE.CREATED });
    });
  }

  async getOpenedIssues() {
    return await this.issuesRepo
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.type', 'type')
      .innerJoinAndSelect('i.client_location', 'client_location')
      .innerJoinAndSelect('client_location.province', 'province')
      .innerJoinAndSelect(
        'client_location.municipality',
        'prmunicipalityovince',
      )
      .leftJoinAndSelect(
        'i.applications',
        'applications',
        `applications.state='${ISSUE_APPLICATION_STATE.PENDENT}'`,
      )
      .leftJoin('applications.tech', 'app_tech')
      .addSelect(['app_tech.username'])
      .innerJoin('i.user', 'u')
      .addSelect(['u.username', 'u.name', 'u.lastname', 'u.phone_number'])
      .where('i.state=:state', { state: ISSUE_STATE.CREATED })
      .getMany();
  }

  async getIssueFromDb(
    id: number,
    updater?: typeof updateQb,
  ): Promise<IssuesEntity> {
    const qb = this.issuesRepo
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.type', 'type')
      .innerJoinAndSelect('i.client_location', 'client_location')
      .innerJoinAndSelect('client_location.province', 'province')
      .innerJoinAndSelect(
        'client_location.municipality',
        'prmunicipalityovince',
      )
      .innerJoin('i.user', 'u')
      .addSelect(['u.username', 'u.name', 'u.lastname'])
      .where('i.id=:id', { id });

    if (updater) updater(qb);

    return await qb.getOne();

    // return await this.issuesRepo.findOne({

    //   relations: [
    //     'type',
    //     'user',
    //     'client_location',
    //     'client_location.province',
    //     'client_location.municipality',
    //   ],
    //   where: {
    //     id,
    //     ...extraConditions,
    //   },
    // });
  }

  async getUserIssuesApplications(username: string) {
    return await this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoinAndSelect('ia.issue', 'i')
      .innerJoin('i.user', 'u')
      .innerJoin('ia.tech', 'tu')
      .addSelect(['tu.username'])
      .addSelect(['u.username'])
      .where('u.username=:username', { username })
      .getMany();
    const a = 7;
  }

  async createIssueApplication(
    username: string,
    issue: number,
    {
      max_price,
      min_price,
      max_date,
      message,
      min_date,
    }: {
      min_date?: Date;
      max_date?: Date;
      min_price: number;
      max_price: number;
      message?: string;
    },
  ) {
    const i = await this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'u')
      .addSelect(['u.username'])
      .where('i.id=:issue', { issue })
      .getOne();
    if (!i) throw new NotFoundException(`Incidencia no existe`);

    const already = await this.issuesAppRepo
      .createQueryBuilder('a')
      .select(['a.id'])
      .innerJoin('a.tech', 'u')
      .where('u.username=:username', { username })
      .getOne();

    if (already)
      throw new ForbiddenException(
        'El técnico ya tiene una solicitud presentada',
      );

    const tech: any = await this.usersService.getUserPrivateData(username);

    try {
      const app = await this.issuesAppRepo.save({
        tech: tech,
        date: new Date(),
        issue: i,
        max_date,
        max_price,
        message,
        min_date,
        min_price,
        state: ISSUE_APPLICATION_STATE.PENDENT,
      });

      this.broker.emit(NEW_ISSUE_APPLICATION, {
        issue: i,
        application: app,
      });
    } catch (e) {
      const a = 8;
    }
  }

  async getUserIssues(username: string, page: number, page_size: number = 10) {
    const qr = this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'u')
      .leftJoinAndSelect('i.client_location', 'cl')
      .leftJoin('i.tech', 'tu')
      .leftJoin('tu.techniccian_info', 'tt')
      .addSelect(['tu.username', 'tu.name', 'tu.lastname', 'tu.phone_number'])
      .where('u.username=:username', { username });

    return await paginate_qr(page, page_size, qr);
  }
}
