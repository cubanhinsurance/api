import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import j2s from 'joi-to-swagger';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { SYS_CONFIG } from '../entities/sysconfig.entity';
import { CONFIG_SCHEMA } from '../schemas/config.schema';
import { System_configService } from '../services/system_config.service';

@ApiTags('config')
@Controller('config')
export class System_configController {
  constructor(private service: System_configService) {}

  @ApiOperation({ description: 'Devuelve la configuracion del sistema' })
  @ApiOkResponse({
    schema: j2s(CONFIG_SCHEMA).swagger,
  })
  @Get()
  async getConfig() {
    return this.service.config;
  }

  @ApiOperation({ description: 'Modifica la configuracion del sistema' })
  @ApiBody({
    schema: j2s(CONFIG_SCHEMA).swagger,
  })
  @Post()
  async setConfig(@Body(new JoiPipe(CONFIG_SCHEMA, null)) body: SYS_CONFIG) {
    return await this.service.setConfig(body);
  }
}
