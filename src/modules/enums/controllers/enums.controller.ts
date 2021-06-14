import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EnumsService } from '../services/enums.service';
import j2s from 'joi-to-swagger';
import {
  MUNICIPALITIES_SCHEMA,
  PROVINCES_SCHEMA,
} from '../schemas/enums.schema';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { array, number, string } from 'joi';
import { NUMBER_COMMA_STRING } from 'src/lib/schemas/strings.schema';
import {
  CREATE_GROUP_SCHEMA,
  CREATE_HABILITIES_SCHEMA,
  GROUPS_QUERY_SCHEMA,
  GROUP_SCHEMA,
  HABILITIES_SCHEMA,
} from '../schemas/habilities.schema';
import {
  CREATE_ISSUE_TREE_NODE_SCHEMA,
  ISSUE_SCHEMA,
  ISSUE_TREE_SCHEMA,
  UPDATE_ISSUE_TREE_NODE_SCHEMA,
} from '../schemas/issues.schema';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { imageFilter } from 'src/lib/multer/filter';
import { Public } from 'src/modules/auth/decorators/public.decorator';

@Controller('enums')
export class EnumsController {
  constructor(private enumsService: EnumsService) {}

  @ApiTags('Enums')
  @ApiOperation({
    summary: 'Devuelve el listado de provincias',
  })
  @ApiOkResponse({
    schema: j2s(PROVINCES_SCHEMA).swagger,
  })
  @Public()
  @Get('provinces')
  async getProvinces() {
    return await this.enumsService.getProvinces();
  }

  @ApiTags('Enums')
  @ApiOperation({
    summary: 'Devuelve el listado de municipios de una provincia',
  })
  @ApiParam({
    name: 'provinces',
    description: 'Listado de ids separados por coma ex: 1|1,2,3',
  })
  @Public()
  @Get('municipalities/:provinces')
  @ApiOkResponse({
    schema: j2s(MUNICIPALITIES_SCHEMA).swagger,
  })
  async getMunicipalities(
    @Param('provinces', new JoiPipe(NUMBER_COMMA_STRING))
    provinces: string,
  ) {
    return await this.enumsService.getMunicipalities(
      provinces.split(',').map((v) => +v),
    );
  }

  @ApiTags('Enums')
  @ApiOperation({
    summary: 'Devuelve listado de grupos de habilidades con sus habilidades',
  })
  @ApiOkResponse({
    schema: j2s(GROUPS_QUERY_SCHEMA).swagger,
  })
  @Get('habilities')
  async getHabilitiesGroups() {
    return await this.enumsService.getHabilitiesGroups();
  }

  @ApiTags('Enums')
  @ApiOperation({ summary: 'Crea grupos de competencias' })
  @ApiCreatedResponse({
    schema: j2s(GROUP_SCHEMA).swagger,
  })
  @ApiBody({
    schema: j2s(CREATE_GROUP_SCHEMA).swagger,
  })
  @Post('habilities')
  async createHabilitiesGroup(
    @Body(new JoiPipe(CREATE_GROUP_SCHEMA)) group: any,
  ) {
    return await this.enumsService.createHabilitiesGroups(group);
  }

  @ApiTags('Enums')
  @Put('habilities/:group')
  async updateHabilityGroup() {
    //todo annadir updates 2 groups and others
  }

  @ApiOperation({ summary: 'Crea competencias en un grupo' })
  @ApiCreatedResponse({
    schema: j2s(HABILITIES_SCHEMA).swagger,
  })
  @ApiBody({
    schema: j2s(CREATE_HABILITIES_SCHEMA).swagger,
  })
  @Post('habilities/:group')
  async createHabilities(
    @Param('group', ParseIntPipe) group: number,
    @Body(new JoiPipe(CREATE_HABILITIES_SCHEMA)) hability: any,
  ) {
    return await this.enumsService.createHability(group, hability);
  }

  @ApiTags('Enums')
  @ApiOperation({
    summary: 'Devuelve el listado de Tipos de incidencias con su jerarquia',
  })
  @ApiOkResponse({
    schema: j2s(array().items(ISSUE_TREE_SCHEMA)).swagger,
  })
  @Get('issues')
  async getIssues() {
    return await this.enumsService.getIssuesTree();
  }

  @ApiOperation({ summary: 'Crea grupos/incidencias de manera jerarquica' })
  @ApiQuery({
    name: 'parent',
    required: false,
    description: 'Id de la categoria padre',
  })
  @ApiBody({
    schema: j2s(CREATE_ISSUE_TREE_NODE_SCHEMA).swagger,
  })
  @ApiCreatedResponse({
    schema: j2s(ISSUE_SCHEMA).swagger,
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      fileFilter: imageFilter,
    }),
  )
  @Post('issues')
  async createIssueType(
    @Query('parent', new JoiPipe(number().optional().allow(null)))
    parent: number,
    @Body(
      new JoiPipe(CREATE_ISSUE_TREE_NODE_SCHEMA, null, ['questions', 'rules']),
    )
    issue: any,
    @UploadedFile() avatar,
  ) {
    if (avatar) issue.avatar = avatar.buffer;

    return await this.enumsService.createIssueType(issue, parent);
  }

  @ApiOperation({ summary: 'Actualiza los datos de una incidencia' })
  @ApiQuery({
    name: 'parent',
    required: false,
    description: 'Id de la categoria padre',
  })
  @ApiBody({
    schema: j2s(UPDATE_ISSUE_TREE_NODE_SCHEMA).swagger,
  })
  @ApiOkResponse({
    schema: j2s(ISSUE_SCHEMA).swagger,
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      fileFilter: imageFilter,
    }),
  )
  @Put('issues/:issue')
  async updateIssueType(
    @Query('parent', new JoiPipe(number().optional().allow(null)))
    parent: number,
    @Body(
      new JoiPipe(UPDATE_ISSUE_TREE_NODE_SCHEMA, null, ['questions', 'rules']),
    )
    issue: any,
    @UploadedFile() avatar,
    @Param('issue', ParseIntPipe) issue_id: number,
  ) {
    if (avatar) issue.avatar = avatar.buffer;

    return await this.enumsService.updateIssueType(issue_id, issue, parent);
  }
}
