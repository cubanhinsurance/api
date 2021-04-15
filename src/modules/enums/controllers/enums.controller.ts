import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { EnumsService } from '../services/enums.service';
import j2s from 'joi-to-swagger';
import {
  MUNICIPALITIES_SCHEMA,
  PROVINCES_SCHEMA,
} from '../schemas/enums.schema';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { string } from 'joi';
import { NUMBER_COMMA_STRING } from 'src/lib/schemas/strings.schema';
import {
  CREATE_GROUP_SCHEMA,
  CREATE_HABILITIES_SCHEMA,
  GROUPS_QUERY_SCHEMA,
  GROUP_SCHEMA,
  HABILITIES_SCHEMA,
} from '../schemas/habilities.schema';

@Controller('enums')
export class EnumsController {
  constructor(private enumsService: EnumsService) {}

  @ApiOperation({
    summary: 'Devuelve el listado de provincias',
  })
  @ApiOkResponse({
    schema: j2s(PROVINCES_SCHEMA).swagger,
  })
  @Get('provinces')
  async getProvinces() {
    return await this.enumsService.getProvinces();
  }

  @ApiOperation({
    summary: 'Devuelve el listado de municipios de una provincia',
  })
  @ApiParam({
    name: 'provinces',
    description: 'Listado de ids separados por coma ex: 1|1,2,3',
  })
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
}
