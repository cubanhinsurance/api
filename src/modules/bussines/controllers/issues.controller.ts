import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { array, number, string } from 'joi';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { User } from 'src/modules/auth/decorators/user.decorator';
import j2s from 'joi-to-swagger';
import {
  CREATE_ISSUE_SCHEMA,
  ISSUES_APPLICATION_STATES,
  ISSUE_APPLICATION,
} from '../schemas/issues.schema';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IssuesService } from '../services/issues.service';
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
    @Param('location', new JoiPipe(number().required())) location: number,
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
    @Param('issue', new JoiPipe(number())) issue: number,
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
    @Param('application', new JoiPipe(number())) application: number,
    @User('username') username: string,
  ) {
    return await this.issuesService.getTechAplyngDetails(username, application);
  }

  @ApiOperation({
    summary: 'Ignorar una incidencia',
  })
  @Delete('application/:issue')
  async ignoreIssue(
    @Param('issue', new JoiPipe(number())) issue: number,
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
    schema: j2s(array().items(string().valid(...Object.values(ISSUE_STATE))))
      .swagger,
  })
  @Get('user')
  async getLoggedUserIssues(
    @PageSize() pz: number,
    @Page() p: number,
    @User('username') username: string,
    @Query(
      'state',
      new JoiPipe(
        array().items(
          string()
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
    @Param('issue', new JoiPipe(number())) issue: number,
    @Param('username') username,
  ) {
    return await this.issuesService.getIssueDetails(issue, username);
  }

  @ApiOperation({
    summary: 'Obtiene lo detalles de una incidencia',
  })
  @Get('issue/:issue')
  async getLoggedUsserIssueDetails(
    @Param('issue', new JoiPipe(number())) issue: number,
    @User('username') username,
  ) {
    return await this.issuesService.getIssueDetails(issue);
  }

  @ApiOperation({
    summary: 'Cancela la incidencia de un usuario autenticado',
  })
  @Delete('issue/:issue')
  async cancelIssue(
    @Param('issue', new JoiPipe(number())) issue: number,
    @User('username') username: string,
  ) {
    await this.issuesService.cancelIssue(username, issue);
  }

  @ApiOperation({
    summary: 'Acepta la aplicacion de un tecnico en una incidencia',
  })
  @Post('issue/:issue/:username')
  async acceptTech(
    @Param('issue', new JoiPipe(number())) issue: number,
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
    schema: j2s(string().max(100).optional()).swagger,
  })
  @Delete('issue/:issue/:username')
  async rejectTech(
    @Param('issue', new JoiPipe(number())) issue: number,
    @Param('username') tech: string,
    @User('username') username: string,
    @Query('reason', new JoiPipe(string().max(100).optional())) reason: string,
  ) {
    await this.issuesService.rejectTech(username, tech, issue, reason);
  }

  @ApiOperation({
    summary: 'Cancela una solicitud de aplicacion de una incidencia',
  })
  @Delete('application/:issue/:application')
  async cancelIssueApplication(
    @User('username') username,
    @Param('issue', new JoiPipe(number().required())) issue,
    @Param('application', new JoiPipe(number().required())) app,
  ) {
    await this.issuesService.cancelIssueApplication(username, issue, app);
  }

  @ApiOperation({
    summary:
      'Comienza la ejecucion de una incidencia por el tecnico autenticado',
  })
  @Post('tech/:issue')
  async beginIssue(
    @Param('issue', new JoiPipe(number().required())) issue,
    @User('username') tech,
  ) {
    return await this.issuesService.beginIssue(tech, issue);
  }
}
