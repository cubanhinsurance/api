import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import {
  AGENTS_SCHEMA,
  TECH_SCHEMA,
  UPDATE_AGENT_SCHEMA,
  UPDATE_TECH_SCHEMA,
  UPDATE_USER_SCHEMA,
  USERS_SCHEMA,
} from '../schemas/users.schema';
import { UsersService } from '../services/users.service';
import j2s from 'joi-to-swagger';
import { UserDto } from '../dtos/user.dto';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Post('user')
  @ApiBody({
    schema: j2s(USERS_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Crear un nuevo usuario',
  })
  @ApiConflictResponse({ description: 'Usuario ya existe' })
  @ApiCreatedResponse({ description: 'Usuario creado con exito' })
  @ApiBadRequestResponse({ description: 'Parametros de entrada incorrectos' })
  async createUser(@Body(new JoiPipe(USERS_SCHEMA)) user: any) {
    const created = await this.users.createUser(user);
  }

  @Put('user/:username')
  @ApiBody({
    schema: j2s(UPDATE_USER_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Actualizar datos de un usuario',
  })
  @ApiOkResponse({ description: 'Usuario actualizado satisfactoriamente' })
  @ApiForbiddenResponse({ description: `Las credenciales no coinciden` })
  @ApiNotFoundResponse({ description: 'Usuario no existe' })
  @ApiBadRequestResponse()
  async updateUser(
    @Param('username') username: string,
    @Body(new JoiPipe(UPDATE_USER_SCHEMA)) body: object,
  ) {
    const updated = await this.users.updateUser(username, body);
  }

  @Post('agent')
  @ApiBody({
    schema: j2s(AGENTS_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Crear un nuevo agente',
  })
  @ApiConflictResponse({ description: 'Agente ya existe' })
  @ApiCreatedResponse({ description: 'Agente creado con exito' })
  @ApiBadRequestResponse({ description: 'Parametros de entrada incorrectos' })
  async createAgent(@Body(new JoiPipe(AGENTS_SCHEMA)) agent: any) {
    const created = await this.users.createAgent(agent);
  }

  @Put('agent/:agent')
  @ApiBody({
    schema: j2s(UPDATE_AGENT_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Actualizar datos de un agente',
  })
  @ApiOkResponse({ description: 'Usuario actualizado satisfactoriamente' })
  @ApiNotFoundResponse({ description: 'Usuario no existe' })
  @ApiBadRequestResponse()
  async updateAgent(
    @Param('agent') agent: string,
    @Body(new JoiPipe(UPDATE_AGENT_SCHEMA)) body: object,
  ) {
    const updated = await this.users.updateAgent(agent, body);
  }

  @Post('tech')
  @ApiBody({
    schema: j2s(TECH_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Crear un nuevo tecnico',
  })
  @ApiConflictResponse({ description: 'Tenico ya existe' })
  @ApiCreatedResponse({ description: 'Tenico creado con exito' })
  @ApiBadRequestResponse({ description: 'Parametros de entrada incorrectos' })
  async createTech(@Body(new JoiPipe(TECH_SCHEMA)) tech: any) {
    const created = await this.users.createTechnichian(tech);
  }

  @Put('tech/:tech')
  @ApiBody({
    schema: j2s(UPDATE_TECH_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Actualizar datos de un tecnico',
  })
  @ApiOkResponse({ description: 'Tecnico actualizado satisfactoriamente' })
  @ApiNotFoundResponse({ description: 'Usuario no existe' })
  @ApiBadRequestResponse()
  async updateTech(
    @Param('tech') tech: string,
    @Body(new JoiPipe(UPDATE_TECH_SCHEMA)) body: object,
  ) {
    const updated = await this.users.updateTechnichian(tech, body);
  }
}
