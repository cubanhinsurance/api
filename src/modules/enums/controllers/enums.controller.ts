import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { EnumsService } from '../services/enums.service';
import j2s from 'joi-to-swagger';
import {
  MUNICIPALITIES_SCHEMA,
  PROVINCES_SCHEMA,
} from '../schemas/enums.schema';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { string } from 'joi';
import { NUMBER_COMMA_STRING } from 'src/lib/schemas/strings.schema';

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
}
