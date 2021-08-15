import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { array, boolean, number, object, string } from 'joi';
import { LocationsController } from 'src/modules/client/controllers/locations.controller';
import { LocationsService } from 'src/modules/client/services/locations.service';
import { IssuesTypesEntity } from 'src/modules/enums/entities/issues_types.entity';
import { EnumsService } from 'src/modules/enums/services/enums.service';
import { ISSUE_CREATED } from 'src/modules/io/io.constants';
import { TechsIoService } from 'src/modules/io/services/techs_io.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { FindConditions, Repository } from 'typeorm';
import { IssuesEntity, ISSUE_STATE } from '../entities/issues.entity';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(IssuesEntity)
    private issuesRepo: Repository<IssuesEntity>,
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
        })
        .execute();

      const i = await this.getOpennedIssue(id);

      this.broker.emit(ISSUE_CREATED, i);
    } catch (e) {
      const a = 8;
    }
  }

  async getOpennedIssue(id: number) {
    return await this.getIssueFromDb(id, {
      state: ISSUE_STATE.CREATED,
    });
  }

  async getIssueFromDb(
    id: number,
    extraConditions: FindConditions<IssuesEntity> = {},
  ): Promise<IssuesEntity> {
    return await this.issuesRepo.findOne({
      relations: [
        'type',
        'client_location',
        'client_location.province',
        'client_location.municipality',
      ],
      where: {
        id,
        ...extraConditions,
      },
    });
  }
}
