import {
  Body,
  Controller,
  Delete,
  Get,
  Head,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as joi from 'joi';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { User } from 'src/modules/auth/decorators/user.decorator';
import j2s from 'joi-to-swagger';
import {
  CREATE_ISSUE_SCHEMA,
  ISSUES_APPLICATION_STATES,
  ISSUE_APPLICATION,
  RATING_SCHEMA,
} from '../schemas/issues.schema';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  IssuesService,
  PROGRESS_ISSUES_ACTIONS,
} from '../services/issues.service';
import { imageFilter } from 'src/lib/multer/filter';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HttpValidTechLicense } from 'src/modules/auth/guards/activeTech.guard';
import {
  Page,
  PageSize,
} from 'src/lib/decorators/pagination_queries.decorator';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { USER_NAME_SCHEMA } from 'src/modules/auth/schemas/signin.schema';
import { ISSUE_STATE } from '../entities/issues.entity';
import { Action } from 'rxjs/internal/scheduler/Action';
import { boolean } from 'joi';

@ApiTags('Issues')
@Controller('issues')
export class IssuesController {
  constructor(private issuesService: IssuesService) {}

  @Post('user/:location')
  @ApiOperation({
    summary: 'Crear una incidencia',
  })
  @UseInterceptors(
    FilesInterceptor('photos', null, {
      fileFilter: imageFilter,
    }),
  )
  @ApiBody({
    schema: j2s(CREATE_ISSUE_SCHEMA).swagger,
  })
  async createIssue(
    @User('username') username,
    @Param('location', new JoiPipe(joi.number().required())) location: number,
    @Body(new JoiPipe(CREATE_ISSUE_SCHEMA, true, ['data'])) data,
    @UploadedFiles() photos: any[],
  ) {
    if (photos && photos?.length > 0) {
      data.photos = photos;
    }
    //todo recoger fotos
    await this.issuesService.addIssue(username, location, data);
  }

  @ApiOperation({
    summary: 'Aplicar para una incidencia',
  })
  @ApiBody({
    schema: j2s(ISSUE_APPLICATION).swagger,
  })
  @Post('application/:issue')
  async addIssueApplication(
    @Param('issue', new JoiPipe(joi.number())) issue: number,
    @User('username') username: string,
    @Body(new JoiPipe(ISSUE_APPLICATION)) app,
  ) {
    await this.issuesService.createIssueApplication(username, issue, app);
  }

  @ApiOperation({
    summary: 'Obtener detalles de una solicitud de aplicaion a una incidencia',
  })
  @Get('application/:application')
  async getApplicationDetails(
    @Param('application', new JoiPipe(joi.number())) application: number,
    @User('username') username: string,
  ) {
    return await this.issuesService.getTechAplyngDetails(username, application);
  }

  @ApiOperation({
    summary: 'Ignorar una incidencia',
  })
  @Delete('application/:issue')
  async ignoreIssue(
    @Param('issue', new JoiPipe(joi.number())) issue: number,
    @User('username') username: string,
  ) {
    await this.issuesService.ignoreIssue(username, issue);
  }

  @ApiOperation({
    summary: 'Obtiene las incidencias de un usuario',
  })
  @Get('user/:username')
  async getUserIssues(
    @PageSize() pz: number,
    @Page() p: number,
    @Param('username') username: string,
  ) {
    return await this.issuesService.getUserIssues(username, p, pz);
  }

  @ApiOperation({
    summary: 'Obtiene las incidencias del usuario autenticado',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    schema: j2s(
      joi.array().items(joi.string().valid(...Object.values(ISSUE_STATE))),
    ).swagger,
  })
  @Get('user')
  async getLoggedUserIssues(
    @PageSize() pz: number,
    @Page() p: number,
    @User('username') username: string,
    @Query(
      'state',
      new JoiPipe(
        joi.array().items(
          joi
            .string()
            .valid(...Object.values(ISSUE_STATE))
            .optional(),
        ),
      ),
    )
    state,
  ) {
    return await this.issuesService.getUserIssues(username, p, pz, state);
  }

  @ApiOperation({
    summary: 'Obtiene lo detalles de una incidencia de un usuario',
  })
  @Get('issue/:username/:issue')
  @Public()
  async getUsserIssueDetails(
    @Param('issue', new JoiPipe(joi.number())) issue: number,
    @Param('username') username,
  ) {
    return await this.issuesService.getIssueDetails(issue, username);
  }

  @ApiOperation({
    summary: 'Obtiene lo detalles de una incidencia',
  })
  @Get('issue/:issue')
  async getLoggedUsserIssueDetails(
    @Param('issue', new JoiPipe(joi.number())) issue: number,
    @User('username') username,
  ) {
    return await this.issuesService.getIssueDetails(issue);
  }

  @ApiOperation({
    summary: 'Cancela la incidencia de un usuario autenticado',
  })
  @Delete('issue/:issue')
  async cancelIssue(
    @Param('issue', new JoiPipe(joi.number())) issue: number,
    @User('username') username: string,
  ) {
    await this.issuesService.cancelIssue(username, issue);
  }

  @ApiOperation({
    summary: 'Acepta la aplicacion de un tecnico en una incidencia',
  })
  @Post('issue/:issue/:username')
  async acceptTech(
    @Param('issue', new JoiPipe(joi.number())) issue: number,
    @Param('username') tech: string,
    @User('username') username: string,
  ) {
    return await this.issuesService.acceptTech(username, tech, issue);
  }

  @ApiOperation({
    summary:
      'Devuelve las solicitudes de aceptacion de incidencias del tecnico autenticado',
  })
  @Get('applications')
  @ApiQuery({
    name: 'state',
    required: false,
    schema: j2s(ISSUES_APPLICATION_STATES).swagger,
  })
  async getLoggedTechApplications(
    @User('username') username: string,
    @PageSize() pz,
    @Page() p,
    @Query('state', new JoiPipe(ISSUES_APPLICATION_STATES.optional())) state,
  ) {
    return await this.issuesService.getTechApplyngIssues(
      username,
      p,
      pz,
      state,
    );
  }

  @ApiOperation({
    summary: 'Rechaza la solicitud de un tecnico',
  })
  @ApiQuery({
    name: 'reason',
    required: false,
    description: 'Razon por la que  se rechaza',
    type: 'string',
    schema: j2s(joi.string().max(100).optional()).swagger,
  })
  @Delete('issue/:issue/:username')
  async rejectTech(
    @Param('issue', new JoiPipe(joi.number())) issue: number,
    @Param('username') tech: string,
    @User('username') username: string,
    @Query('reason', new JoiPipe(joi.string().max(100).optional()))
    reason: string,
  ) {
    await this.issuesService.rejectTech(username, tech, issue, reason);
  }

  @ApiOperation({
    summary: 'Cancela una solicitud de aplicacion de una incidencia',
  })
  @Delete('application/:issue/:application')
  async cancelIssueApplication(
    @User('username') username,
    @Param('issue', new JoiPipe(joi.number().required())) issue,
    @Param('application', new JoiPipe(joi.number().required())) app,
  ) {
    await this.issuesService.cancelIssueApplication(username, issue, app);
  }

  @ApiOperation({
    summary: 'Comienza la ejecucion de una incidencia del tecnico autenticado',
  })
  @Post('tech/:issue')
  async beginIssue(
    @Param('issue', new JoiPipe(joi.number().required())) issue,
    @User('username') tech,
  ) {
    return await this.issuesService.beginIssue(tech, issue);
  }

  @ApiOperation({
    summary: 'Pospone la ejecucion de una incidencia del tecnico autenticado',
  })
  @Put('tech/:issue/:description')
  async postPoneIssue(
    @Param('issue', new JoiPipe(joi.number().required())) issue,
    @Param('description') description,
    @User('username') tech,
  ) {
    return await this.issuesService.postponeIssue(tech, issue, description);
  }

  @ApiOperation({
    summary: 'Actualiza la informacion de ruteo de una incidencia',
  })
  @Head('tech/:issue')
  async refreshIssueInfo(
    @Param('issue', new JoiPipe(joi.number().required())) issue,
    @User('username') tech,
  ) {
    await this.issuesService.refreshRoute(issue, tech);
  }

  @ApiOperation({
    summary: 'Confirma la llegada de un tecnico al lugar de la incidencia',
  })
  @Post('tech/arrived/:issue')
  async notifyTechArrived(
    @Param('issue', new JoiPipe(joi.number().required())) issue,
    @User('username') tech,
  ) {
    await this.issuesService.confirmArrived(tech, issue);
  }

  @ApiOperation({
    summary: 'Confirma la finalizacion de un issue del tecnico autenticado',
  })
  @Post('tech/finish/:issue')
  async notifyFinish(
    @Param('issue', new JoiPipe(joi.number().required())) issue,
    @User('username') tech,
  ) {
    await this.issuesService.confirmFinished(tech, issue);
  }

  @ApiOperation({
    summary:
      'Evaluar a un cliente autor de una issue por el tecnico autenticado',
  })
  @ApiBody({
    schema: j2s(RATING_SCHEMA).swagger,
  })
  @Post('rate/client/:issue')
  async rateClient(
    @Param('issue', new JoiPipe(joi.number().required())) issue,
    @User('username') tech,
    @Body(new JoiPipe(RATING_SCHEMA)) rating,
  ) {
    await this.issuesService.rateClient(tech, issue, rating);
  }

  @ApiOperation({
    summary:
      'Evaluar a un tecnico autor de una issue por el tecnico autenticado',
  })
  @ApiBody({
    schema: j2s(RATING_SCHEMA).swagger,
  })
  @Post('rate/tech/:issue')
  async rateTech(
    @Param('issue', new JoiPipe(joi.number().required())) issue,
    @User('username') client,
    @Body(new JoiPipe(RATING_SCHEMA)) rating,
  ) {
    await this.issuesService.rateTech(client, issue, rating);
  }

  @ApiOperation({
    summary: 'Devuelve los reviews de un usuario',
  })
  @ApiQuery({
    name: 'tech',
    type: 'boolean',
    description: 'Define si se buscaran los reviews como tecnico',
    required: false,
  })
  @ApiQuery({
    name: 'likes',
    type: 'boolean',
    description: 'Define si se filtrara por los likes o los dislikes',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'page_size',
    type: 'number',
    required: false,
  })
  @Get('rate/:username')
  async getReviews(
    @Param('username') username,
    @Query('tech', new JoiPipe(joi.boolean().default(false).optional())) tech,
    @Query('likes', new JoiPipe(joi.boolean().optional())) likes,
    @Page() page,
    @PageSize() page_size,
  ) {
    return await this.issuesService.getUserReviews(
      username,
      page,
      page_size,
      tech,
      likes,
    );
  }

  @ApiQuery({
    description: 'Obtiene las tareas completadas de un tecnico autenticado',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'page_size',
    type: 'number',
    required: false,
  })
  @Get('tech/completed_tasks')
  async getLoggedTechCompletedTasks(
    @User('username') tech,
    @Page() page,
    @PageSize() page_size,
  ) {
    return await this.issuesService.getTechCompletedIssues(
      tech,
      page,
      page_size,
    );
  }
}
