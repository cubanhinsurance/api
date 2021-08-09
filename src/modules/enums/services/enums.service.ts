import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import {
  findOrFail,
  handleNumberArr,
} from 'src/lib/typeorm/id_colection_handler';
import { TypeOrmRepo } from 'src/lib/typeorm/repository';
import { EntityRepository, In, IsNull, Repository } from 'typeorm';
import {
  CreateHabilityDto,
  CreateHabilityGroupDto,
  HabilityRuleOr,
} from '../dtos/habilities.dto';
import { IssuesQuestionsDTO, QUESTION_TYPES } from '../dtos/questions.dto';
import { CoinsEntity } from '../entities/coins.entity';
import { HabilitiesEntity } from '../entities/habilities.entity';
import { HabilitiesGroupsEntity } from '../entities/habilities_groups.entity';
import { HabilitiesRequirementsEntity } from '../entities/habilities_reqs.entity';
import { IssuesTypesEntity } from '../entities/issues_types.entity';
import { MunicialitiesEntity } from '../entities/municipalities.entity';
import { PayGatewaysEntity } from '../entities/pay_gateways.entity';
import { ProvincesEntity } from '../entities/provinces.entity';

@Injectable()
export class EnumsService {
  constructor(
    @InjectRepository(ProvincesEntity)
    private provinces: Repository<ProvincesEntity>,
    @InjectRepository(IssuesTypesEntity)
    private issuesTypes: Repository<IssuesTypesEntity>,
    @InjectRepository(MunicialitiesEntity)
    private muncs: Repository<MunicialitiesEntity>,
    @InjectRepository(HabilitiesEntity)
    private habilities: Repository<HabilitiesEntity>,
    @InjectRepository(PayGatewaysEntity)
    private payGateways: Repository<PayGatewaysEntity>,
    @InjectRepository(HabilitiesRequirementsEntity)
    private habilities_reqs: Repository<HabilitiesRequirementsEntity>,
    @InjectRepository(HabilitiesGroupsEntity)
    private habilities_groups: Repository<HabilitiesGroupsEntity>,
  ) {
    const a = 7;
  }

  async getProvinces() {
    return await this.provinces.find({
      select: ['id', 'name', 'short_name', 'code'],
    });
  }

  async getMunicipalities(provinces?: number | number[]) {
    const provincesFilter = provinces
      ? typeof provinces == 'number'
        ? [provinces]
        : provinces
      : null;
    return await this.muncs.find({
      select: ['id', 'code', 'name', 'short_name'],
      relations: ['province'],
      where: provincesFilter ? { province: In(provincesFilter) } : null,
    });
  }

  async getHabilitiesGroups() {
    return await this.habilities_groups.find({
      relations: ['habilities', 'habilities.requirements'],
    });
  }

  async createHabilitiesGroups(data: CreateHabilityGroupDto) {
    const exists = await this.habilities_groups.findOne({
      name: data.name,
    });

    if (exists)
      throw new ConflictException(`Ya existe un grupo llamado: ${data.name}`);

    return await this.habilities_groups.save(data);
  }

  async createHability(group: number, data: CreateHabilityDto) {
    const grp = await this.habilities_groups.findOne({
      id: group,
    });

    if (!grp) throw new NotFoundException(`Grupo no existe`);

    return await this.habilities.save({ ...data, group: grp });
  }

  async parseIssue(issue: IssuesTypesEntity) {
    if (!issue.rules) return issue;
    let new_rules = [];
    for (const rule of issue.rules) {
      new_rules.push(
        await this.habilities.find({
          where: { id: In(rule) },
        }),
      );
    }

    issue.rules = new_rules;

    return issue;
  }

  async resolveIssue(issue: IssuesTypesEntity) {}

  async getIssuesTree(parent?: IssuesTypesEntity, visited?: object) {
    if (parent && parent.id in visited) return [];

    visited = visited ?? {};

    const issues = await this.issuesTypes.find({
      relations: ['childs'],
      where: {
        parent: parent ?? IsNull(),
      },
    });

    for (const issue of issues) {
      await this.parseIssue(issue);
      if (issue.childs.length > 0) {
        issue.childs = await this.getIssuesTree(issue, visited);
      }
      visited[issue.id] = true;
    }

    return issues;
  }

  async createIssueType(
    {
      name,
      avatar,
      description,
      questions,
      rules,
    }: {
      name: string;
      description?: string;
      questions?: IssuesQuestionsDTO[];
      avatar?: Buffer;
      rules?: HabilityRuleOr;
    },
    parent?: number,
  ) {
    const base64 =
      typeof avatar != 'undefined' ? avatar.toString('base64') : null;

    const parentObj = parent
      ? await this.issuesTypes.findOne({
          id: parent,
        })
      : null;

    if (typeof parent != 'undefined' && !parentObj)
      throw new NotFoundException(`Padre ${parent} no encontrado`);

    const exists = await this.issuesTypes.findOne({
      where: {
        name,
        parent: parentObj ? parentObj : null,
      },
    });

    if (exists)
      throw new ConflictException(
        `Ya existe una incidencia con el nombre :"${name}" en esa categoria`,
      );

    if (rules) {
      let habilitiesIds = [];
      for (const rule of rules) {
        habilitiesIds = [...habilitiesIds, ...rule];
      }
      const habilitiesObjs = await handleNumberArr(
        habilitiesIds,
        this.habilities,
        'No se encontraron las habilidades ',
      );
    }

    return await this.parseIssue(
      await this.issuesTypes.save({
        name,
        description,
        questions,
        avatar: base64,
        parent: parentObj,
        rules,
      }),
    );
  }

  async updateIssueType(
    issue_id: number,
    {
      name,
      avatar,
      description,
      questions,
      rules,
    }: {
      name?: string;
      description?: string;
      questions?: IssuesQuestionsDTO[];
      avatar?: Buffer;
      rules?: HabilityRuleOr;
    },
    parent?: number | null,
  ) {
    const base64 =
      typeof avatar != 'undefined' ? avatar.toString('base64') : null;

    const parentObj = parent
      ? await this.issuesTypes.findOne({
          id: parent,
        })
      : null;

    if (typeof parent != 'undefined' && !parentObj)
      throw new NotFoundException(`Padre ${parent} no encontrado`);

    const exists =
      typeof name == 'undefined'
        ? null
        : await this.issuesTypes.findOne({
            where: {
              name,
              parent: parentObj ? parentObj : null,
            },
          });

    if (exists)
      throw new ConflictException(
        `Ya existe una incidencia con el nombre :"${name}" en esa categoria`,
      );

    if (rules) {
      let habilitiesIds = [];
      for (const rule of rules) {
        habilitiesIds = [...habilitiesIds, ...rule];
      }
      const habilitiesObjs = await handleNumberArr(
        habilitiesIds,
        this.habilities,
        'No se encontraron las habilidades ',
      );
    }

    const issueObj = await this.issuesTypes.findOne({
      relations: ['parent'],
      where: {
        id: issue_id,
      },
    });

    if (!issueObj)
      throw new NotFoundException(`Incidencia ${issue_id} no existe`);

    if (typeof name != 'undefined') issueObj.name = name;
    if (typeof avatar != 'undefined') issueObj.avatar = base64;
    if (typeof description != 'undefined') issueObj.description = description;
    if (typeof questions != 'undefined') issueObj.questions = questions;
    if (typeof parent != 'undefined') issueObj.parent = parentObj;

    return await this.parseIssue(await this.issuesTypes.save(issueObj));
  }

  async deleteHabilityGroup(group: any) {
    const { id } = await findOrFail<HabilitiesGroupsEntity>(
      { where: { id: group } },
      this.habilities_groups,
    );

    await this.habilities_groups.softDelete(id);
  }

  async deleteHability(group: any, hability: any) {
    const { id } = await findOrFail<HabilitiesEntity>(
      { where: { id: hability, group } },
      this.habilities,
    );

    await this.habilities.softDelete(id);
  }

  async deleteIssueType(issue: any) {
    const { id } = await findOrFail<IssuesTypesEntity>(
      { where: { id: issue } },
      this.issuesTypes,
    );

    await this.issuesTypes.softDelete(id);
  }

  async getCoins() {
    // return await this.coins.find({
    //   select: ['name', 'id'],
    //   where: {
    //     active: true,
    //   },
    // });
  }

  // async createCoin({ name, factor }: { name: string; factor: number }) {
  //   await this.coinsEntity.save({
  //     name,
  //     factor,
  //   });
  // }

  async updateCoin() {}

  async getPayGateways() {
    return await this.payGateways.find({
      select: ['id', 'name', 'avatar'],
    });
  }

  async getIssueType(type:number){
    return await this.issuesTypes.findOne(type)
  }
}
