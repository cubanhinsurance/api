import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import j2s from 'joi-to-swagger';
import {
  CREATE_ROLE_SCHEMA,
  ROLES_LIST_SCHEMA,
  UPDATE_ROLE_SCHEMA,
} from '../schemas/roles.schemas';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { STRING_COMMA_STRING } from 'src/lib/schemas/strings.schema';

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

  @ApiOperation({ summary: 'Crea un nuevo rol' })
  @ApiBody({
    schema: j2s(CREATE_ROLE_SCHEMA).swagger,
  })
  @Post()
  async createRole(@Body(new JoiPipe(CREATE_ROLE_SCHEMA)) body: any) {
    return await this.rolesService.createRole(body);
  }

  @ApiOperation({ summary: 'Adiciona funcionalidades a un rol' })
  @ApiParam({
    name: 'functionalities',
    description:
      'Funcionalidad o listado de funcionalidades separadas por coma',
  })
  @Post(':role/:functionalities')
  async addFunctionality2Role(
    @Param('role', ParseIntPipe) role: number,
    @Param('functionalities', new JoiPipe(STRING_COMMA_STRING)) funcs: string,
  ) {
    return await this.rolesService.addFunctionality2Role(
      role,
      funcs.split(','),
    );
  }

  @ApiOperation({ summary: 'Elimina funcionalidades a un rol' })
  @ApiParam({
    name: 'functionalities',
    description:
      'Funcionalidad o listado de funcionalidades separadas por coma',
  })
  @Delete(':role/:functionalities')
  async removeFunctionality2Role(
    @Param('role', ParseIntPipe) role: number,
    @Param('functionalities', new JoiPipe(STRING_COMMA_STRING)) funcs: string,
  ) {
    return await this.rolesService.removeFunctionality2Role(
      role,
      funcs.split(','),
    );
  }

  @ApiOperation({ summary: 'Actualiza los datos de un rol' })
  @ApiBody({
    schema: j2s(UPDATE_ROLE_SCHEMA).swagger,
  })
  @Put(':role')
  async updateRole(
    @Body(new JoiPipe(UPDATE_ROLE_SCHEMA)) body: any,
    @Param('role', ParseIntPipe) role: number,
  ) {
    return await this.rolesService.updateRole(role, body);
  }
}
