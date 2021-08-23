import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { number } from 'joi';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { User } from 'src/modules/auth/decorators/user.decorator';
import j2s from 'joi-to-swagger';
import {
  CREATE_ISSUE_SCHEMA,
  ISSUE_APPLICATION,
} from '../schemas/issues.schema';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IssuesService } from '../services/issues.service';
import { imageFilter } from 'src/lib/multer/filter';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HttpValidTechLicense } from 'src/modules/auth/guards/activeTech.guard';
import {
  Page,
  PageSize,
} from 'src/lib/decorators/pagination_queries.decorator';
import { Public } from 'src/modules/auth/decorators/public.decorator';

@ApiTags('Issues')
@Controller('issues')
export class IssuesController {
  constructor(private issuesService: IssuesService) {}

  @Post('user/:location')
  @ApiOperation({
    description: 'Crear una incidencia',
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
    @Body(new JoiPipe(CREATE_ISSUE_SCHEMA)) data,
    @UploadedFiles() photos: any[],
  ) {
    if (photos && photos?.length > 0) {
      data.photos = photos;
    }
    //todo recoger fotos
    await this.issuesService.addIssue(username, location, data);
  }

  @ApiOperation({
    description: 'Aplicar para una incidencia',
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
    description: 'Obtiene las incidencias de un usuario',
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
    description: 'Obtiene las incidencias del usuario autenticado',
  })
  @Get('user')
  async getLoggedUserIssues(
    @PageSize() pz: number,
    @Page() p: number,
    @User('username') username: string,
  ) {
    return await this.issuesService.getUserIssues(username, p, pz);
  }

  @ApiOperation({
    description: 'Obtiene lo detalles de una incidencia de un usuario',
  })
  @Get('issue/:username/:issue')
  @Public()
  async getUsserIssueDetails(
    @Param('issue', new JoiPipe(number())) issue: number,
    @Param('username') username,
  ) {
    return await this.issuesService.getIssueDetails(username, issue);
  }

  @ApiOperation({
    description:
      'Obtiene lo detalles de una incidencia del usuario autenticado',
  })
  @Get('issue/:issue')
  async getLoggedUsserIssueDetails(
    @Param('issue', new JoiPipe(number())) issue: number,
    @User('username') username,
  ) {
    return await this.issuesService.getIssueDetails(username, issue);
  }

  @ApiOperation({
    description: 'Cancela la incidencia de un usuario autenticado',
  })
  @Delete('issue/:issue')
  async cancelIssue(
    @Param('issue', new JoiPipe(number())) issue: number,
    @User('username') username: string,
  ) {
    await this.issuesService.cancelIssue(username, issue);
  }

  @ApiOperation({
    description: 'Acepta la aplicacion de un tecnico en una incidencia',
  })
  @Post('issue/:issue/:username')
  async acceptTech(
    @Param('issue', new JoiPipe(number())) issue: number,
    @Param('username') tech: string,
    @User('username') username: string,
  ) {
    await this.issuesService.acceptTech(username, tech, issue);
  }
}
