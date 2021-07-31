import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { number, object, string } from 'joi';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import j2s from 'joi-to-swagger';
import { LON_LAT_SCHEMA } from '../schemas/gis.schema';
import { GisService } from '../services/gis.service';
import { Public } from 'src/modules/auth/decorators/public.decorator';

@ApiTags('Servicios de mapas')
@Controller('gis')
export class GisController {
  constructor(private gisService: GisService) {}

  @ApiOperation({
    description: 'Devuelve la provincia y municipio de un punto',
  })
  @ApiOkResponse({
    schema: j2s(
      object({
        province: {
          id: number(),
          name: string(),
        },
        municipality: {
          id: number(),
          name: string(),
        },
      }),
    ).swagger,
  })
  @ApiParam({
    name: 'lonlat',
    schema: j2s(LON_LAT_SCHEMA).swagger,
  })
  @ApiBadRequestResponse({
    description: 'El punto no se encuentra en ningun municipio',
  })
  @Get('whereis/:lonlat')
  async reverseLocation(
    @Param('lonlat', new JoiPipe(LON_LAT_SCHEMA.required())) point: string,
  ) {
    const [x, y] = point.split(',');
    return await this.gisService.whereis(+x, +y);
  }

  @Get('zoomto')
  @ApiOperation({
    description:
      'Obtiene el bbox a partir de id de dpa para la navegacion en el mapa',
  })
  @ApiOkResponse({
    description: 'Devuelve GeoJson<Polygon> representando el bbox del dpa',
  })
  @ApiNotFoundResponse({ description: 'No se encontro ese dpa' })
  async zoom2Province(
    @Query('province', new JoiPipe(number().optional())) province,
    @Query('municipality', new JoiPipe(number().optional())) municipality,
  ) {
    return await this.gisService.zoomto({ province, municipality });
  }
}
