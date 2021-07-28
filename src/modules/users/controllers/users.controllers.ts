import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import {
  AGENTS_SCHEMA,
  REGISTER_USER_SCHEMA,
  TECH_APPLICANTS_SCHEMA,
  TECH_APPLICANT_SCHEMA,
  TECH_APP_SCHEMA,
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
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { TechApplicationsService } from '../services/tech_applications.service';
import { boolean } from 'joi';

@Controller('users')
export class UsersController {
  constructor(
    private users: UsersService,
    private techApp: TechApplicationsService,
  ) {}

  @ApiTags('Users')
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
    @Query('q', new JoiPipe(USERS_FILTERS, true, true)) query: any,
  ) {
    return await this.users.getUsers(page, page_size, query);
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Devuelve los datos de un usuario' })
  @ApiOkResponse({
    schema: j2s(USER_QUERY_RESULT).swagger,
  })
  @Get('user/:username')
  async getUserPrivateData(@Param('username') username: string) {
    return await this.users.getUserPrivateData(username);
  }

  @ApiTags('Users')
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

  @ApiTags('Users')
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

  @ApiTags('Users')
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

  @ApiTags('Users')
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

  @ApiTags('Users')
  @Post('tech')
  @ApiBody({
    schema: j2s(TECH_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Crear un nuevo tecnico',
  })
  @UseInterceptors(
    FileInterceptor('confirmation_photo', {
      fileFilter: imageFilter,
    }),
  )
  @ApiConflictResponse({ description: 'Tenico ya existe' })
  @ApiCreatedResponse({ description: 'Tenico creado con exito' })
  @ApiBadRequestResponse({ description: 'Parametros de entrada incorrectos' })
  async createTech(
    @Body(new JoiPipe(TECH_SCHEMA, true, ['habilities'])) tech: any,
    @UploadedFile() confirmation_photo,
  ) {
    if (confirmation_photo) tech.confirmation_photo = confirmation_photo.buffer;
    const created = await this.users.createTechnichian(tech);
  }

  @ApiTags('Users')
  @Put('tech/:tech')
  @ApiBody({
    schema: j2s(UPDATE_TECH_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Actualizar datos de un tecnico',
  })
  @UseInterceptors(
    FileInterceptor('confirmation_photo', {
      fileFilter: imageFilter,
    }),
  )
  @ApiOkResponse({ description: 'Tecnico actualizado satisfactoriamente' })
  @ApiNotFoundResponse({ description: 'Usuario no existe' })
  @ApiBadRequestResponse()
  async updateTech(
    @Param('tech') tech: string,
    @Body(new JoiPipe(UPDATE_TECH_SCHEMA, true, ['habilities'])) body: any,
    @UploadedFile() confirmation_photo,
  ) {
    if (confirmation_photo) body.confirmation_photo = confirmation_photo.buffer;
    const updated = await this.users.updateTechnichian(tech, body);
  }

  @ApiTags('Users')
  @Delete('user/:username')
  @ApiOperation({
    summary: 'Eliminar un usuario',
  })
  async deleteUser(@Param('username') username: string) {
    await this.deleteUser(username);
  }

  @ApiTags('Users')
  @Delete('agent/:agent')
  @ApiOperation({
    summary: 'Eliminar un agente',
  })
  async deleteAgent(@Param('username') username: string) {
    await this.deleteAgent(username);
  }

  @ApiTags('Users')
  @Delete('tech/:tech')
  @ApiOperation({
    summary: 'Eliminar un tecnico',
  })
  async deleteTechnician(@Param('username') username: string) {
    await this.deleteTechnician(username);
  }

  @ApiTags('Users')
  @Post('register')
  @ApiBody({
    schema: j2s(REGISTER_USER_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFilter,
    }),
  )
  @ApiConflictResponse({ description: 'Usuario ya existe' })
  @ApiCreatedResponse({ description: 'Usuario creado con exito' })
  @ApiBadRequestResponse({ description: 'Parametros de entrada incorrectos' })
  @Public()
  async registerUser(
    @Body(new JoiPipe(REGISTER_USER_SCHEMA)) user: any,
    @UploadedFile() photo,
  ) {
    if (photo) user.photo = photo.buffer;
    const created = await this.users.createUser({ ...user, confirmed: false });
    return await this.users.sendVerificationEmail(user.username);
  }

  @ApiTags('Users', 'TechApplication')
  @Post('tech_application')
  @ApiOperation({
    summary: 'Crear una solicitud de creacion/actualizacion de un tecnico',
  })
  @ApiBody({
    schema: j2s(TECH_APP_SCHEMA).swagger,
  })
  @UseInterceptors(
    FileInterceptor('confirmation_photo', {
      fileFilter: imageFilter,
    }),
  )
  async createTechApplicant(
    @User('username') username,
    @UploadedFile() confirmation_photo,
    @Body(new JoiPipe(TECH_APP_SCHEMA, true, ['habilities'])) tech: any,
  ) {
    if (confirmation_photo) tech.confirmation_photo = confirmation_photo.buffer;
    else
      throw new BadRequestException(
        'La foto (confirmation_photo) es obligatoria',
      );

    tech.username = username;
    const updated = await this.techApp.createApplicant(tech);
  }

  @ApiTags('Users', 'TechApplication')
  @Get('tech_application/:tech_application_id')
  @ApiOperation({
    summary: 'Devuelve los detalles de una aplicacion a tecnico sin resolver',
  })
  @ApiOkResponse({
    schema: j2s(TECH_APPLICANT_SCHEMA).swagger,
  })
  async getApplicantDetails(@Param('tech_application_id') id: number) {
    return await this.techApp.getApplicantInfo(id);
  }

  @ApiTags('Users', 'TechApplication')
  @Put('tech_application/:tech_application_id/:confirmed')
  @ApiOperation({
    summary: 'Confirma o deniega una solicitud a tecnico',
  })
  @ApiParam({
    name: 'confirmed',
    type: Boolean,
  })
  @ApiQuery({
    name: 'description',
    required: false,
    description: 'Razon de la decision tomada',
  })
  async confirmTechApplication(
    @User('username') username,
    @Param('tech_application_id') id: number,
    @Query('description') description,
    @Param('confirmed', new JoiPipe(boolean().required())) confirmed: boolean,
  ) {
    return await this.techApp.confirmTechApplication(
      username,
      id,
      confirmed,
      description,
    );
  }

  @ApiTags('Users', 'TechApplication')
  @Delete('tech_application/:tech_application_id')
  @ApiOperation({
    summary: 'Cancela una solicitud',
  })
  async cancelTechApplication(
    @User('username') username,
    @Param('tech_application_id') id: number,
  ) {
    return await this.techApp.cancelTechApplication(
      username,
      id
    );
  }

  @ApiTags('Users', 'TechApplication')
  @Get('tech_applications')
  @ApiOperation({
    summary: 'Devuelve las solicitudes de tecnicos sin confirmar',
  })
  @ApiOkResponse({
    schema: j2s(TECH_APPLICANTS_SCHEMA).swagger,
  })
  async getApplications(@PageSize() ps: number, @Page() p: number) {
    return await this.techApp.getApplicants(p, ps);
  }
}
