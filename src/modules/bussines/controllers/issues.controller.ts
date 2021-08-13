import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { number } from 'joi';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { User } from 'src/modules/auth/decorators/user.decorator';
import j2s from 'joi-to-swagger';
import { CREATE_ISSUE_SCHEMA } from '../schemas/issues.schema';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IssuesService } from '../services/issues.service';

@ApiTags('Issues')
@Controller('issues')
export class IssuesController {
  constructor(private issuesService: IssuesService) {}

  @Post('user/:location')
  @ApiOperation({
    description: 'Crear una incidencia',
  })
  @ApiBody({
    schema: j2s(CREATE_ISSUE_SCHEMA).swagger,
  })
  async createIssue(
    @User('username') username,
    @Param('location', new JoiPipe(number().required())) location: number,
    @Body(new JoiPipe(CREATE_ISSUE_SCHEMA)) data,
  ) {
    await this.issuesService.addIssue(username, location, data);
  }

  @ApiOperation({
    description: 'Devuelve listado de incidencias incidencias abiertas'
  })
  @Get('open')
  async getOpenIssues(@User('username') username){

  }
}
