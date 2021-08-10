import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { array, boolean, number, object, string } from 'joi';
import { LocationsController } from 'src/modules/client/controllers/locations.controller';
import { LocationsService } from 'src/modules/client/services/locations.service';
import { IssuesTypesEntity } from 'src/modules/enums/entities/issues_types.entity';
import { EnumsService } from 'src/modules/enums/services/enums.service';
import { TechsIoService } from 'src/modules/io/services/techs_io.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { Repository } from 'typeorm';
import { IssuesEntity, ISSUE_STATE } from '../entities/issues.entity';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(IssuesEntity)
    private issuesRepo: Repository<IssuesEntity>,
    private techsIoService: TechsIoService,
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
      maxDistance,
      date,
      expiration_date,
      max,
      scheduled,
      scheduled_description,
      data = {},
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
          location: () => `st_geomfromgeojson('${JSON.stringify(loc.geom)}')`,
          client_location: loc,
        })
        .execute();

      const i = await this.getIssue(id);
      this.notifyIssueTechs(i);
      const b = 6;
    } catch (e) {
      const a = 8;
    }
  }

  async getIssue(id: number): Promise<IssuesEntity> {
    return await this.issuesRepo.findOne({
      relations: [
        'type',
        'client_location',
        'client_location.province',
        'client_location.municipality',
      ],
      where: {
        id,
      },
    });
  }

  async notifyIssueTechs(issue: IssuesEntity) {
    for await (const techs of this.techsIoService.getAvailableTechsByRules(
      issue.type,
    )) {
      const a = 7;
    }
    const a = 6;
  }
}
