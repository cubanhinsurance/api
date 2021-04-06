import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { FunctionalitiesEntity } from '../entities/functionalities.entity';
import { FunctionalitiesService } from '../services/functionalities.service';
import j2s from 'joi-to-swagger';
import { array, number, object, string } from 'joi';
import { FunctionalitiesList } from '../schemas/functionalities.schemas';

@Controller('functionalities')
export class FunctionalitiesController {
  constructor(private funcsService: FunctionalitiesService) {}

  @ApiOperation({
    summary: 'Devuelve el listado de funcionalidades del sistema',
  })
  @Get()
  @ApiOkResponse({
    schema: j2s(FunctionalitiesList).swagger,
  })
  async getFunctionalities(): Promise<FunctionalitiesEntity[]> {
    return await this.funcsService.getFunctionalitiesList();
  }
}
