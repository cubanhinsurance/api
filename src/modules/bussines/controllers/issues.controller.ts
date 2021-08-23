import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
    @Param('issue') issue: number,
    @User('username') username: string,
    @Body(new JoiPipe(ISSUE_APPLICATION)) app,
  ) {
    await this.issuesService.createIssueApplication(username, issue, app);
  }

  @ApiOperation({
    description: 'Obtiene las incidencias de un usuario',
  })
  @Get('user/:username')
  @Public()
  async getUserIssues(
    @PageSize() pz: number,
    @Page() p: number,
    @Param('username') username: string,
  ) {
    return await this.issuesService.getUserIssues(username, p, pz);
  }

  @ApiOperation({
    description: 'Obtiene las incidencias de un usuario',
  })
  @Get('user')
  async getLoggedUserIssues(
    @PageSize() pz: number,
    @Page() p: number,
    @User('username') username: string,
  ) {
    return await this.issuesService.getUserIssues(username, p, pz);
  }
}
