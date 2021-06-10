import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import {
  AGENTS_SCHEMA,
  TECH_SCHEMA,
  UPDATE_AGENT_SCHEMA,
  UPDATE_TECH_SCHEMA,
  UPDATE_USER_SCHEMA,
  USERS_FILTERS,
  USERS_QUERY_RESULTS,
  USERS_SCHEMA,
  USER_QUERY_RESULT,
} from '../schemas/users.schema';
import { UsersService } from '../services/users.service';
import j2s from 'joi-to-swagger';
import { UserDto } from '../dtos/user.dto';
import {
  Page,
  PageSize,
} from 'src/lib/decorators/pagination_queries.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFilter } from 'src/lib/multer/filter';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @ApiOperation({ summary: 'Devuelve listado de usuarios del sistema' })
  @ApiOkResponse({
    schema: j2s(USERS_QUERY_RESULTS).swagger,
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Filtros de la api',
    schema: j2s(USERS_FILTERS).swagger,
  })
  @Get()
  async getUsersList(
    @Page() page: number,
    @PageSize() page_size: number,
    @Query('q') query: any,
  ) {
    return await this.users.getUsers(page, page_size, query);
  }

  @ApiOperation({ summary: 'Devuelve los datos de un usuario' })
  @ApiOkResponse({
    schema: j2s(USER_QUERY_RESULT).swagger,
  })
  @Get('user/:username')
  async getUserPrivateData(@Param('username') username: string) {
    return await this.users.getUserPrivateData(username);
  }

  @Post('user')
  @ApiBody({
    schema: j2s(USERS_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Crear un nuevo usuario',
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFilter,
    }),
  )
  @ApiConflictResponse({ description: 'Usuario ya existe' })
  @ApiCreatedResponse({ description: 'Usuario creado con exito' })
  @ApiBadRequestResponse({ description: 'Parametros de entrada incorrectos' })
  async createUser(
    @Body(new JoiPipe(USERS_SCHEMA)) user: any,
    @UploadedFile() photo,
  ) {
    if (photo) user.photo = photo.buffer;
    const created = await this.users.createUser(user);
  }

  @Put('user/:username')
  @ApiBody({
    schema: j2s(UPDATE_USER_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Actualizar datos de un usuario',
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFilter,
    }),
  )
  @ApiOkResponse({ description: 'Usuario actualizado satisfactoriamente' })
  @ApiForbiddenResponse({ description: `Las credenciales no coinciden` })
  @ApiNotFoundResponse({ description: 'Usuario no existe' })
  @ApiBadRequestResponse()
  async updateUser(
    @Param('username') username: string,
    @Body(new JoiPipe(UPDATE_USER_SCHEMA)) body: any,
    @UploadedFile() photo,
  ) {
    if (photo) body.photo = photo.buffer;
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
