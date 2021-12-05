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
import * as joi from 'joi';
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
  ISSUE_IN_PROGRESS,
  ISSUE_ON_THE_WAY,
  ISSUE_PAUSED,
  NEW_ISSUE_APPLICATION,
  TECH_ACCEPTED,
  TECH_REJECTED,
  TECH_ARRIVED,
  ISSUE_FINISHED,
  TECH_ISSUE_FINISHED,
  TECH_RATED,
  CLIENT_RATED,
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
import { IssuesCacheService } from './issues_cache.service';
import { RatingsEntity } from '../entities/ratings.entity';

const updateQb = (qb: SelectQueryBuilder<IssuesEntity>): void => {};

export enum PROGRESS_ISSUES_ACTIONS {
  BEGIN = 'begin',
  START = 'start',
  RESUME = 'resume',
  PAUSE = 'pause',
}

export interface RATING_I {
  date?: Date;
  description?: string;
  rating: number;
  price?: number;
  like?: boolean;
}

@Injectable()
export class IssuesService implements OnModuleInit {
  constructor(
    @InjectRepository(IssuesEntity)
    private issuesRepo: Repository<IssuesEntity>,
    @InjectRepository(IssuesTraces)
    private issuesTracesRepo: Repository<IssuesTraces>,
    @InjectRepository(IgnoredIssuesEntity)
    private ignoredIssuesRepo: Repository<IgnoredIssuesEntity>,
    @InjectRepository(RatingsEntity)
    private ratingsEntity: Repository<RatingsEntity>,
    @InjectRepository(IssueApplication)
    private issuesAppRepo: Repository<IssueApplication>,
    @Inject('BROKER') private broker: ClientProxy,
    private usersService: UsersService,
    private locationsService: LocationsService,
    private enumsService: EnumsService,
    private techsCache: IssuesCacheService,
  ) {}

  get issuesQr(): SelectQueryBuilder<IssuesEntity> {
    return this.issuesRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.client_location', 'client_location')
      .leftJoinAndSelect('client_location.province', 'province')
      .leftJoinAndSelect('client_location.municipality', 'prmunicipalityovince')
      .innerJoin('i.user', 'u')
      .innerJoinAndSelect('i.type', 'issuetype')
      .leftJoin('i.tech', 'tu')
      .leftJoin('tu.techniccian_info', 'tt')
      .addSelect(['tu.username', 'tu.name', 'tu.lastname', 'tu.phone_number'])
      .addSelect(['u.username', 'u.name', 'u.lastname', 'u.phone_number']);
  }

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
            q = joi.string();
            break;
          case 'options':
            q = joi.array().items(joi.string().valid(...options));
            break;
          case 'boolean':
            q = joi.boolean();
            break;
          case 'number':
            q = joi.number();
            break;
        }

        if (q) {
          if (required) q = q.required();
          else q = q.allow(null).optional();
        }

        questionsSchema[i] = q;
      });
    }

    const schema = joi.object(questionsSchema);

    const { value, error } = await schema.validate(data, { convert: true });
    if (error)
      throw new BadRequestException(`Formulario incorrecto: ${error.message}`);
    data = value;

    if (scheduled == true) {
      const h = 7;
    }

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

  async addNewIssueTrace(
    issue: IssuesEntity,
    state: ISSUE_STATE,
    date?: Date,
    description?: string,
  ) {
    try {
      const trace = await this.issuesTracesRepo.save({
        date: date ?? new Date(),
        state,
      });
      const history = await this.issuesRepo
        .createQueryBuilder('u')
        .relation(IssuesEntity, 'traces')
        .of(issue)
        .add(trace);
    } catch (e) {
      const a = 7;
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

  async getUserIssuesApplications(
    username: string,
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
      .innerJoin('ia.tech', 'tu')
      .addSelect(['tu.username'])
      .addSelect(['u.username'])
      .where('u.username=:username', { username });

    if (state) {
      qr.andWhere('ia.state=:state', { state });
    }

    return await qr.getMany();
    const a = 7;
  }

  async getIssueApplications(
    issue: number,
    author?: string,
    techDetails: boolean = true,
  ) {
    const qr = this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoinAndSelect('ia.issue', 'i')
      .innerJoinAndSelect('i.client_location', 'client_location')
      .innerJoinAndSelect('client_location.province', 'province')
      .innerJoinAndSelect(
        'client_location.municipality',
        'prmunicipalityovince',
      )
      .innerJoin('i.user', 'u')
      .innerJoin('ia.tech', 'tu')
      .addSelect(['tu.username'])
      .addSelect(['u.username'])
      .where('i.id=:issue and ia.state=:pendent', {
        issue,
        pendent: ISSUE_APPLICATION_STATE.PENDENT,
      });

    if (author) {
      qr.andWhere('u.username=:author', { author });
    }

    const apps = await qr.getMany();

    if (techDetails) {
      const techsInfo = await Promise.all(
        apps.map((app) => this.getTechInfo(app.tech.username, app.issue)),
      );

      return apps.map(({ tech, ...app }, index) => {
        const { distance, info, review } = techsInfo[index];

        (info.techniccian_info as any).review = review;
        return { ...app, tech: { ...info }, distance };
      });
    }

    return apps;
  }

  async getTechInfo(tech: string, issue?: IssuesEntity) {
    const [info, review] = await Promise.all([
      this.usersService.getUserPrivateData(tech),
      this.usersService.getTechniccianReview(tech),
    ]);

    const distance = issue
      ? await this.techsCache.getIssueTechDistanceInfo(issue, tech)
      : false;

    return {
      info,
      review,
      distance,
    };
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

    if (!application) throw new NotFoundException();

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
      .where('i.id=:issue and i.state=:created', {
        issue,
        created: ISSUE_STATE.CREATED,
      })
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

      const reviews = await this.usersService.getTechniccianReview(username);
      app.tech.techniccian_info.review = reviews;

      this.broker.emit(NEW_ISSUE_APPLICATION, {
        issue: await this.getIssueDetails(issue, null, false),
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

  async getUserIssues(
    username: string,
    page: number,
    page_size: number = 10,
    state?: ISSUE_STATE[],
    orderAsc?: boolean,
  ) {
    const qr = this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'u')
      .innerJoinAndSelect('i.type', 'issuetype')
      .leftJoinAndSelect('i.client_location', 'cl')
      .innerJoinAndSelect('cl.province', 'province')
      .innerJoinAndSelect('cl.municipality', 'prmunicipalityovince')
      .leftJoinAndSelect('i.traces', 'traces')
      .leftJoin('i.tech', 'tu')
      .leftJoin('tu.techniccian_info', 'tt')
      .leftJoin(
        'i.applications',
        'applications',
        'i.state=:created and applications.state=:pendent',
        {
          created: ISSUE_STATE.CREATED,
          pendent: ISSUE_APPLICATION_STATE.PENDENT,
        },
      )
      .addSelect([
        'tu.username',
        'tu.name',
        'tu.lastname',
        'tu.phone_number',
        'applications.id',
      ])
      .where('u.username=:username', { username });

    if (state) {
      qr.andWhere('i.state in (:...state)', { state });
    }

    if (typeof orderAsc != 'undefined') {
      qr.orderBy('i.date', orderAsc ? 'ASC' : 'DESC');
    }

    const res = await paginate_qr(page, page_size, qr);

    // for (const issue of res.data) {
    // }

    return res;
  }

  async getIssueDetails(
    issue: number,
    username?: string,
    handleState: boolean = true,
  ) {
    const qr = await this.issuesRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.client_location', 'cl')
      .innerJoinAndSelect('cl.province', 'province')
      .innerJoinAndSelect('cl.municipality', 'prmunicipalityovince')
      .innerJoin('i.user', 'u')
      .innerJoinAndSelect('i.type', 'issuetype')
      .leftJoinAndSelect('i.traces', 'traces')
      .where('i.id=:issue', { issue })
      .leftJoin('i.tech', 'tu')
      .leftJoin('tu.techniccian_info', 'tt')
      .addSelect(['tu.username', 'tu.name', 'tu.lastname', 'tu.phone_number'])
      .addSelect(['u.username', 'u.name', 'u.lastname', 'u.phone_number']);

    if (username) {
      qr.andWhere('u.username=:username', { username });
    }

    const i = await qr.getOne();

    if (!i) throw new NotFoundException();

    if (!!i?.tech?.username) {
      const { info, review } = await this.getTechInfo(i.tech.username);
      (i as any).tech = { ...info, review };
      (i as any).tech.techniccian_info.review = review;
    }

    if (handleState) {
      switch (i.state) {
        case ISSUE_STATE.CREATED:
          (i as any).applications = await this.getIssueApplications(issue);
          break;
        case ISSUE_STATE.ACCEPTED:
          {
            const application = await this.issuesAppRepo
              .createQueryBuilder('aps')
              .innerJoin('aps.tech', 'tech')
              .innerJoin('aps.issue', 'issue')
              .where('issue.id=:issue and tech.username=:tech', {
                issue,
                tech: i.tech.username,
              })
              .getOne();
            (i as any).application = application;
            // const { info, review } = await this.getTechInfo(i.tech.username);
            // (i as any).tech = { ...info, review };
          }
          break;
        case ISSUE_STATE.TRAVELING:
          {
            const wsTech = this.techsCache.findTechClient(i.tech.username);
            if (!!wsTech && wsTech?.client?.progress) {
              const {
                issue,
                tech,
                refresh_date,
                arrive_date,
                distance: { distance, linearDistance, duration },
                application,
              } = wsTech?.client?.progress;

              (i as any).arrive_info = {
                duration,
                distance,
                linearDistance,
                refresh_date,
                arrive_date,
              };
              (i as any).application = wsTech.client.progress.application;
            }
            const g = 7;
          }
          break;
        case ISSUE_STATE.PROGRESS:
          {
            const wsTech = this.techsCache.findTechClient(i.tech.username);
            if (!!wsTech && wsTech?.client?.progress) {
              (i as any).application = wsTech.client.progress.application;
            }
          }
          break;
        case ISSUE_STATE.COMPLETED:
          {
            const application = await this.issuesAppRepo
              .createQueryBuilder('aps')
              .innerJoin('aps.tech', 'tech')
              .innerJoin('aps.issue', 'issue')
              .where('issue.id=:issue and tech.username=:tech', {
                issue,
                tech: i.tech.username,
              })
              .getOne();
            (i as any).application = application;
          }
          break;
      }
    }

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

  async acceptTech(
    author: string,
    tech: string,
    issue: number,
    description?: string,
  ) {
    const app = await this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoinAndSelect('ia.issue', 'i')
      .leftJoinAndSelect('i.client_location', 'client_location')
      .innerJoinAndSelect('i.type', 'issuetype')
      .innerJoinAndSelect('client_location.province', 'province')
      .innerJoinAndSelect(
        'client_location.municipality',
        'prmunicipalityovince',
      )
      .innerJoin('i.user', 'u')
      .innerJoin('ia.tech', 'tu')
      .addSelect(['tu.username', 'tu.id'])
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

    if (
      app.state != ISSUE_APPLICATION_STATE.PENDENT &&
      app.issue.state != ISSUE_STATE.PROGRESS &&
      app.issue.state != ISSUE_STATE.TRAVELING
    )
      throw new ConflictException(
        'Aplicacion no se encuentra en estado pendiente',
      );

    await this.issuesAppRepo.save({
      id: app.id,
      state: ISSUE_APPLICATION_STATE.ACCEPTED,
    });

    const issueUpdated = await this.issuesRepo.save({
      id: app.issue.id,
      tech: app.tech,
      state: ISSUE_STATE.ACCEPTED,
    });

    const others = await this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoin('ia.issue', 'i')
      .innerJoin('ia.tech', 'tech')
      .select(['tech.username', 'ia.id'])
      .where('tech.username<>:tech and i.id=:issue and ia.state=:pendent', {
        tech,
        issue,
        pendent: ISSUE_APPLICATION_STATE.PENDENT,
      })
      .getMany();

    if (others.length > 0) {
      const changedOthers = await Promise.all(
        others.map(({ id }) =>
          this.issuesAppRepo.save({
            id,
            state: ISSUE_APPLICATION_STATE.REFUSED,
          }),
        ),
      );
    }

    await this.addNewIssueTrace(
      app.issue,
      ISSUE_STATE.ACCEPTED,
      new Date(),
      description,
    );

    this.broker.emit(TECH_ACCEPTED, {
      issue: await this.getIssueDetails(issue, null, false),
      tech: await this.usersService.getTechnichianInfo(tech),
      application: app,
      refused: others.map(({ tech: { username } }) => username),
    });

    return await this.getIssueDetails(issue, author);
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
      .addSelect(['tu.username', 'tu.id'])
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

    if (app.state == ISSUE_APPLICATION_STATE.REFUSED)
      throw new ConflictException('Ya se encuentra rechazada');

    const updated = await this.issuesAppRepo.save({
      id: app.id,
      state: ISSUE_APPLICATION_STATE.REFUSED,
    });

    try {
      const rejected = await this.ignoredIssuesRepo.save({
        description: reason,
        reason: IGNORED_ISSUE_REASON.REFUSED,
        issue: app.issue,
        user: app.tech,
      });

      this.broker.emit(TECH_REJECTED, app);
    } catch (a) {
      const b = 7;
    }
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

  async beginIssue(tech: string, issue: number) {
    const i = await this.issuesQr
      .where('i.id=:issue and tu.username=:tech and i.state=:accepted', {
        issue,
        tech,
        accepted: ISSUE_STATE.ACCEPTED,
      })
      .getOne();

    if (!i)
      throw new NotFoundException(
        'Verifique si la incidencia existe o si fue aceptada para ese tecnico',
      );

    const updated = await this.issuesRepo.save({
      id: i.id,
      state: ISSUE_STATE.TRAVELING,
    });

    await this.addNewIssueTrace(i, ISSUE_STATE.TRAVELING);

    this.broker.emit(ISSUE_ON_THE_WAY, {
      tech,
      issue: await this.getIssueDetails(issue, null, false),
    });
  }

  async postponeIssue(tech: string, issue: number, description: string) {
    const issueO = await this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.tech', 'tech')
      .innerJoin('i.user', 'author')
      .addSelect(['tech.username', 'author.username'])
      .where('tech.username=:tech and i.id=:issue and i.state=:traveling', {
        tech,
        issue,
        traveling: ISSUE_STATE.TRAVELING,
      })
      .getOne();

    if (!issueO) throw new NotFoundException();

    const issueD = await this.acceptTech(
      issueO.user.username,
      tech,
      issue,
      description,
    );
    this.broker.emit(ISSUE_PAUSED, issueD);
  }

  getAuthorIssuesQr(author: string) {
    return this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'author')
      .innerJoin('i.tech', 'tech')
      .where('author.username=:author', { author });
  }

  async refreshRoute(issue: number, tech: string) {
    const issueDetails = await this.getIssueDetails(issue, null, false);

    if (issueDetails.tech.username != tech)
      throw new NotFoundException(
        `No se encontro una incidencia del cliente/tecnico`,
      );

    this.techsCache.refreshIssueInfo(issueDetails, tech);
  }

  async confirmArrived(tech: string, issue: number, date: Date = new Date()) {
    const issueO = await this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.tech', 'tech')
      .innerJoin('i.user', 'author')
      .addSelect(['tech.username', 'author.username'])
      .where('tech.username=:tech and i.id=:issue', { tech, issue })
      .getOne();

    if (!issueO) throw new NotFoundException();

    if (issueO.state != ISSUE_STATE.TRAVELING)
      throw new ConflictException(
        'La incidencia no se encuentra en estado: Viajando',
      );

    issueO.state = ISSUE_STATE.PROGRESS;

    const updated = await this.issuesRepo.save({
      id: issueO.id,
      state: ISSUE_STATE.PROGRESS,
    });

    await this.addNewIssueTrace(issueO, ISSUE_STATE.PROGRESS);

    const issueDetails = await this.getIssueDetails(issue, null, false);

    this.broker.emit(ISSUE_IN_PROGRESS, issueDetails);
    this.broker.emit(TECH_ARRIVED, issueDetails);
  }

  async confirmFinished(tech: string, issue: number, date: Date = new Date()) {
    const issueO = await this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.tech', 'tech')
      .innerJoin('i.user', 'author')
      .addSelect(['tech.username', 'author.username'])
      .where('tech.username=:tech and i.id=:issue', { tech, issue })
      .getOne();

    if (!issueO) throw new NotFoundException();

    if (issueO.state != ISSUE_STATE.PROGRESS)
      throw new ConflictException('La incidencia no se encuentra en progreso');

    issueO.state = ISSUE_STATE.COMPLETED;

    const updated = await this.issuesRepo.save({
      id: issueO.id,
      state: ISSUE_STATE.COMPLETED,
    });

    await this.addNewIssueTrace(issueO, ISSUE_STATE.COMPLETED);

    const issueDetails = await this.getIssueDetails(issue);

    this.broker.emit(TECH_ISSUE_FINISHED, issueDetails);
    this.broker.emit(ISSUE_FINISHED, issueDetails);
  }

  async rateTech(
    client: string,
    issue: number,
    { description, date, rating, like, price }: RATING_I,
  ) {
    const i = await this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'author')
      .innerJoin('i.tech', 'tech')
      .leftJoinAndSelect('i.evaluations', 'evals')
      .leftJoin('evals.from', 'fr')
      .leftJoin('evals.to', 'to')
      .addSelect([
        'author.id',
        'author.username',
        'tech.id',
        'tech.username',
        'fr.username',
        'to.username',
      ])
      .where('i.id=:issue and author.username=:client and i.state=:completed', {
        issue,
        client,
        completed: ISSUE_STATE.COMPLETED,
      })
      .getOne();

    if (!i)
      throw new NotFoundException(
        'No se encontro una incidencia completada de este author',
      );

    const already = i.evaluations.find(
      ({ from: { username: u } }) => u == client,
    );
    if (already)
      throw new ConflictException(
        'Ya existe una valoracion del tecnico de esa incidencia',
      );

    const saved = await this.ratingsEntity.save({
      date: date ?? new Date(),
      description,
      issue: i,
      like: rating >= 3,
      rating,
      price,
      tech_review: true,
      from: i.user,
      to: i.tech,
    });

    this.broker.emit(TECH_RATED, saved);
  }

  async getUserMeasures(username: string) {
    const [locations, total, completed, pendent] = await Promise.all([
      this.locationsService
        .getUserLocationQr(username)
        .select('count(c.id)', 'locations')
        .getRawOne(),
      this.issuesRepo
        .createQueryBuilder('i')
        .select('count(i.id)', 'total')
        .innerJoin('i.user', 'author')
        .where('author.username=:username', { username })
        .orderBy('i.user')
        .groupBy('i.user')
        .getRawOne(),
      this.issuesRepo
        .createQueryBuilder('i')
        .select('count(i.id)', 'completed')
        .innerJoin('i.user', 'author')
        .where('author.username=:username and i.state=:completed', {
          username,
          completed: ISSUE_STATE.COMPLETED,
        })
        .orderBy('i.user')
        .groupBy('i.user')
        .getRawOne(),
      this.issuesRepo
        .createQueryBuilder('i')
        .select('count(i.id)', 'pendent')
        .innerJoin('i.user', 'author')
        .where('author.username=:username and i.state in (:...pendent)', {
          username,
          pendent: [
            ISSUE_STATE.CREATED,
            ISSUE_STATE.PROGRESS,
            ISSUE_STATE.ACCEPTED,
            ISSUE_STATE.TRAVELING,
          ],
        })
        .orderBy('i.user')
        .groupBy('i.user')
        .getRawOne(),
    ]);

    return {
      locations: locations?.locations ?? 0,
      total: total?.total ?? 0,
      completed: completed?.completed ?? 0,
      pendent: pendent?.pendent ?? 0,
    };
  }

  async rateClient(
    tech: string,
    issue: number,
    { description, date, rating, like, price }: RATING_I,
  ) {
    const i = await this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'author')
      .innerJoin('i.tech', 'tech')
      .leftJoinAndSelect('i.evaluations', 'evals')
      .leftJoin('evals.from', 'fr')
      .leftJoin('evals.to', 'to')
      .addSelect([
        'author.id',
        'author.username',
        'tech.id',
        'tech.username',
        'fr.username',
        'to.username',
      ])
      .where('i.id=:issue and tech.username=:tech and i.state=:completed', {
        issue,
        tech,
        completed: ISSUE_STATE.COMPLETED,
      })
      .getOne();

    if (!i)
      throw new NotFoundException(
        'No se encontro una incidencia completada de este author',
      );

    const already = i.evaluations.find(
      ({ from: { username: u } }) => u == tech,
    );
    if (already)
      throw new ConflictException(
        'Ya existe una valoracion del cliente de esa incidencia',
      );

    const saved = await this.ratingsEntity.save({
      date: date ?? new Date(),
      description,
      issue: i,
      like: rating >= 3,
      rating,
      tech_review: false,
      from: i.tech,
      to: i.user,
      price,
    });

    this.broker.emit(CLIENT_RATED, saved);
  }

  async getUserReviews(
    username: string,
    page: number = 1,
    page_size: number = 10,
    tech: boolean = false,
    likes?: boolean,
  ) {
    const qr = await this.ratingsEntity
      .createQueryBuilder('r')
      .innerJoin('r.from', 'f')
      .innerJoin('r.to', 't')
      .innerJoinAndSelect('r.issue', 'issue')
      .innerJoinAndSelect('issue.client_location', 'cl')
      .innerJoinAndSelect('issue.traces', 'traces')
      .innerJoinAndSelect('cl.province', 'clprov')
      .innerJoinAndSelect('cl.municipality', 'clmunicipality')
      .innerJoinAndSelect('issue.type', 'issuetype')
      .where('t.username=:username and r.tech_review=:tech', { username, tech })
      .addSelect([
        'f.username',
        'f.name',
        'f.lastname',
        't.username',
        't.name',
        't.lastname',
      ])
      .orderBy('r.id', 'DESC');

    if (typeof likes != 'undefined') {
      qr.andWhere('r.like=:likes', { likes });
    }

    try {
      return await paginate_qr(page, page_size, qr);
    } catch (e) {
      const a = 7;
    }
  }

  async getTechCompletedIssues(
    tech: string,
    page: number = 1,
    page_size: number = 5,
  ) {
    return await paginate_qr(
      page,
      page_size,
      this.issuesQr
        .leftJoinAndSelect('i.traces', 'traces')
        .andWhere('tu.username=:tech and i.state=:completed', {
          tech,
          completed: ISSUE_STATE.COMPLETED,
        })
        .innerJoinAndSelect('i.evaluations', 'evals')
        .innerJoinAndSelect(
          'i.applications',
          'applications',
          'applications.tech=tu.id',
        ),
    );
  }
}
