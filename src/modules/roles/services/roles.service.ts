import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { func } from 'joi';
import { FunctionalitiesEntity } from 'src/modules/functionalities/entities/functionalities.entity';
import { In, Repository } from 'typeorm';
import { RoleDto } from '../dtos/roles.dto';
import { RolesEntity } from '../entities/roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RolesEntity) private roles: Repository<RolesEntity>,
    @InjectRepository(FunctionalitiesEntity)
    private funcs: Repository<FunctionalitiesEntity>,
  ) {}

  async getRolesList() {
    return await this.roles.find({
      relations: ['functionalities'],
    });
  }

  async createRole({ description, name, functionalities, root }: RoleDto) {
    const funcs =
      functionalities && functionalities.length > 0
        ? await this.funcs.find({
            where: {
              id: In(functionalities),
            },
          })
        : null;

    if (funcs !== null && funcs.length != functionalities.length) {
      const missing = functionalities.filter(
        (f) => !funcs.find(({ id }) => id == f),
      );

      throw new NotFoundException(
        `No existen las funcionalidades: ${missing.join(',')}`,
      );
    }

    const exists = await this.roles.findOne({
      name,
    });

    if (exists)
      throw new ConflictException(`Ya existe un rol con el nombre: ${name}`);

    const created = await this.roles.save({
      name,
      description,
      root: root ?? false,
      functionalities: funcs,
    });

    const b = 6;
  }

  async addFunctionality2Role(role: number, functionalities: string[]) {
    const roleObj = await this.roles.findOne({
      relations: ['functionalities'],
      where: { id: role },
    });

    if (!roleObj) throw new NotFoundException('Rol no existe');

    const funcs = await this.funcs.find({
      where: { id: In(functionalities) },
    });

    if (funcs.length != functionalities.length) {
      const missing = functionalities.filter(
        (f) => !funcs.find(({ id }) => id == f),
      );

      throw new NotFoundException(
        `No existen las funcionalidades: ${missing.join(',')}`,
      );
    }

    for (const func of funcs) {
      roleObj.functionalities.push(func);
    }

    const updated = await this.roles.save(roleObj);
  }

  async removeFunctionality2Role(role: number, functionalities: string[]) {
    const roleObj = await this.roles.findOne({
      relations: ['functionalities'],
      where: { id: role },
    });

    if (!roleObj) throw new NotFoundException('Rol no existe');

    const funcs = await this.funcs.find({
      where: { id: In(functionalities) },
    });

    if (funcs.length != functionalities.length) {
      const missing = functionalities.filter(
        (f) => !funcs.find(({ id }) => id == f),
      );

      throw new NotFoundException(
        `No existen las funcionalidades: ${missing.join(',')}`,
      );
    }

    roleObj.functionalities = roleObj.functionalities.filter(
      (f) => !funcs.find((func) => func.id == f.id),
    );

    const updated = await this.roles.save(roleObj);
  }

  async updateRole(
    role: number,
    { name, description, functionalities, root }: any,
  ) {
    const roleObj = await this.roles.findOne({
      relations: ['functionalities'],
      where: { id: role },
    });

    if (!roleObj) throw new NotFoundException('Rol no existe');

    roleObj.name = name ?? roleObj.name;
    roleObj.description = description ?? roleObj.description;
    roleObj.root = root ?? roleObj.root;

    if (typeof functionalities != 'undefined') {
      const funcs = await this.funcs.find({
        where: { id: In(functionalities) },
      });

      if (funcs.length != functionalities.length) {
        const missing = functionalities.filter(
          (f) => !funcs.find(({ id }) => id == f),
        );

        throw new NotFoundException(
          `No existen las funcionalidades: ${missing.join(',')}`,
        );
      }

      roleObj.functionalities = funcs;
    }

    const updated = await this.roles.save(roleObj);
  }
}
