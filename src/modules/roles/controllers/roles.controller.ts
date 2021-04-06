import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import j2s from 'joi-to-swagger';
import { ROLES_LIST_SCHEMA } from '../schemas/roles.schemas';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({
    summary: 'Devuelve el listado de roles',
  })
  @ApiOkResponse({
    schema: j2s(ROLES_LIST_SCHEMA).swagger,
  })
  @Get()
  async getRolesList() {
    return await this.rolesService.getRolesList();
  }
}
