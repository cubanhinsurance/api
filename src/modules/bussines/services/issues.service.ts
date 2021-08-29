import {
  BadRequestException,
  ConflictException,
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
  ISSUE_APPLICATION_CANCELLED,
  ISSUE_CANCELLED,
  ISSUE_CREATED,
  ISSUE_IGNORED,
  NEW_ISSUE_APPLICATION,
  TECH_ACCEPTED,
  TECH_REJECTED,
} from 'src/modules/bussines/io.constants';
import { UsersService } from 'src/modules/users/services/users.service';
import { FindConditions, Repository, SelectQueryBuilder } from 'typeorm';
import {
  IssuesEntity,
  IssuesTraces,
  ISSUE_STATE,
} from '../entities/issues.entity';
import {
  IssueApplication,
  ISSUE_APPLICATION_STATE,
} from '../entities/issues_applications.entity';
import { paginate_qr } from 'src/lib/pagination.results';
import { TechApplicationsService } from 'src/modules/users/services/tech_applications.service';
import {
  IgnoredIssuesEntity,
  IGNORED_ISSUE_REASON,
} from '../entities/ignored_issues.entity';
import { ISSUES_APPLICATION_STATES } from '../schemas/issues.schema';

const updateQb = (qb: SelectQueryBuilder<IssuesEntity>): void => {};

@Injectable()
export class IssuesService implements OnModuleInit {
  constructor(
    @InjectRepository(IssuesEntity)
    private issuesRepo: Repository<IssuesEntity>,
    @InjectRepository(IgnoredIssuesEntity)
    private ignoredIssuesRepo: Repository<IgnoredIssuesEntity>,
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
            q = array().items(string().valid(...options));
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

      this.addNewIssueTrace({ id } as IssuesEntity, ISSUE_STATE.CREATED);

      const i = await this.getOpennedIssue(id);

      this.broker.emit(ISSUE_CREATED, i);
    } catch (e) {
      const a = 8;
    }
  }

  async addNewIssueTrace(issue: IssuesEntity, state: ISSUE_STATE, date?: Date) {
    const history = await this.issuesRepo
      .createQueryBuilder('u')
      .relation(IssuesEntity, 'traces')
      .of(issue)
      .add({
        date: date ?? new Date(),
        state,
      } as IssuesTraces);
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

  async getTechApplyngIssues(
    tech: string,
    page: number,
    page_size: number = 10,
    state?: ISSUE_APPLICATION_STATE,
  ) {
    const qr = this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoinAndSelect('ia.issue', 'i')
      .innerJoinAndSelect('i.type', 'issue_type')
      .innerJoinAndSelect('i.client_location', 'client_location')
      .innerJoinAndSelect('client_location.province', 'province')
      .innerJoinAndSelect(
        'client_location.municipality',
        'prmunicipalityovince',
      )
      .innerJoin('i.user', 'u')
      .addSelect(['u.username', 'u.name', 'u.lastname', 'u.phone_number'])
      .innerJoin('ia.tech', 'tu')
      .addSelect(['tu.username'])
      .addSelect(['u.username'])
      .where('tu.username=:tech', { tech });

    if (state) {
      qr.andWhere('ia.state=:state', { state });
    }

    return await paginate_qr(page, page_size, qr);
  }

  async getTechAplyngDetails(tech: string, app: number) {
    const application = await this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoinAndSelect('ia.issue', 'i')
      .innerJoinAndSelect('i.type', 'issue_type')
      .innerJoinAndSelect('i.client_location', 'client_location')
      .innerJoinAndSelect('client_location.province', 'province')
      .innerJoinAndSelect(
        'client_location.municipality',
        'prmunicipalityovince',
      )
      .innerJoin('i.user', 'u')
      .addSelect(['u.username', 'u.name', 'u.lastname', 'u.phone_number'])
      .innerJoin('ia.tech', 'tu')
      .addSelect(['tu.username'])
      .addSelect(['u.username'])
      .where('tu.username=:tech and ia.id=:app', { tech, app })
      .getOne();

    return {
      ...application,
      issue: await this.getIssueDetails(application.issue.id),
    };
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
      .innerJoin('a.issue', 'i')
      .where('u.username=:username and i.id=:issue', { username, issue })
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

  async ignoreIssue(username: string, issue: number) {
    const user = await this.usersService.getUserPrivateData(username);
    const i = await this.issuesRepo.findOne(issue);

    if (!i) throw new NotFoundException('Incidencia no existe');
    if (!user) throw new NotFoundException('Usuario no existe');

    await this.ignoredIssuesRepo.save({
      issue: i,
      user,
    });

    this.broker.emit(ISSUE_IGNORED, {
      username,
      issue,
      reason: IGNORED_ISSUE_REASON.IGNORED,
    });
  }

  async getUserIssues(username: string, page: number, page_size: number = 10) {
    const qr = this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'u')
      .innerJoinAndSelect('i.type', 'issuetype')
      .leftJoinAndSelect('i.client_location', 'cl')
      .leftJoin('i.tech', 'tu')
      .leftJoin('tu.techniccian_info', 'tt')
      .addSelect(['tu.username', 'tu.name', 'tu.lastname', 'tu.phone_number'])
      .where('u.username=:username', { username });

    return await paginate_qr(page, page_size, qr);
  }

  async getIssueDetails(issue: number, username?: string) {
    const qr = await this.issuesRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.client_location', 'cl')
      .innerJoin('i.user', 'u')
      .innerJoinAndSelect('i.type', 'issuetype')
      .where('i.id=:issue', { issue })
      .leftJoin('i.tech', 'tu')
      .leftJoin('tu.techniccian_info', 'tt')
      .addSelect(['tu.username', 'tu.name', 'tu.lastname', 'tu.phone_number']);

    if (username) {
      qr.andWhere('u.username=:username', { username });
    }

    const i = await qr.getOne();

    return i;
  }

  async cancelIssue(username: string, issue: number) {
    const i = await this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'u')
      .where('u.username=:username and i.id=:issue', { username, issue })
      .getOne();

    if (!i)
      throw new NotFoundException('No existe la incidencia para ese usuario');

    if (i.state == ISSUE_STATE.CANCELED) {
      throw new ConflictException('Esa incidencia ya se encuentra cancelada');
    }

    i.state = ISSUE_STATE.CANCELED;
    i.end_date = new Date();

    await this.issuesRepo.save(i);

    this.broker.emit(ISSUE_CANCELLED, issue);
  }

  async acceptTech(author: string, tech: string, issue: number) {
    const app = await this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoinAndSelect('ia.issue', 'i')
      .innerJoin('i.user', 'u')
      .innerJoin('ia.tech', 'tu')
      .addSelect(['tu.username'])
      .addSelect(['u.username'])
      .where('u.username=:author and tu.username=:tech and i.id=:issue', {
        tech,
        author,
        issue,
      })
      .getOne();

    if (!app)
      throw new NotFoundException(
        'No se encontro una solicitud de aplicacion a ninguna incidencia de ese autor',
      );

    await this.issuesAppRepo.save({
      id: app.id,
      state: ISSUE_APPLICATION_STATE.ACCEPTED,
    });

    const issueUpdated = await this.issuesRepo.save({
      id: app.issue.id,
      state: ISSUE_STATE.ACCEPTED,
    });

    this.addNewIssueTrace(app.issue, ISSUE_STATE.ACCEPTED);

    this.broker.emit(TECH_ACCEPTED, await this.getIssueDetails(app.issue.id));
  }

  async rejectTech(
    author: string,
    tech: string,
    issue: number,
    reason?: string,
  ) {
    const app = await this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoinAndSelect('ia.issue', 'i')
      .innerJoin('i.user', 'u')
      .innerJoin('ia.tech', 'tu')
      .addSelect(['tu.username'])
      .addSelect(['u.username'])
      .where('u.username=:author and tu.username=:tech and i.id=:issue', {
        tech,
        author,
        issue,
      })
      .getOne();

    if (!app)
      throw new NotFoundException(
        'No se encontro una solicitud de aplicacion a ninguna incidencia de ese autor',
      );

    const rejected = await this.ignoredIssuesRepo.save({
      description: reason,
      reason: IGNORED_ISSUE_REASON.REFUSED,
      issue: app.issue,
      user: app.tech,
    });

    this.broker.emit(TECH_REJECTED, app);
  }

  async cancelIssueApplication(
    tech: string,
    issue: number,
    application: number,
  ) {
    const app = await this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoinAndSelect('ia.issue', 'i')
      .innerJoin('i.user', 'u')
      .innerJoin('ia.tech', 'tu')
      .addSelect(['tu.username'])
      .addSelect(['u.username'])
      .where('tu.username=:tech and i.id=:issue and ia.id=:application', {
        tech,
        application,
        issue,
      })
      .getOne();

    if (!app)
      throw new NotFoundException(
        `No se encontro una aplicacion para una incidencia de ese usuario`,
      );

    const deleted = await this.issuesAppRepo.softDelete({
      id: app.id,
    });

    this.broker.emit(ISSUE_APPLICATION_CANCELLED, app);
  }
}
