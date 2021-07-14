/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetAll,
  CreateOne,
  UpdateOne,
  DeleteOne,
  AddRelation,
  DeleteRelation,
} from '@atlasjs/typeorm-crud';
import { LicensesService } from '../services/licenses.service';
import j2s from 'joi-to-swagger';
import { array, number, object, string } from 'joi';
import { LicensesEntity } from '../entities/licenses.entity';
@Controller('bussines/licenses')
export class LicensesController {
  constructor(private licenses: LicensesService) {}

  @Get('types')
  @ApiTags('Bussines', 'Licenses')
  @ApiOperation({
    summary: 'Devuelve los tipos de licencias',
  })
  @ApiOkResponse({
    schema: j2s(
      array().items(
        object({
          id: number(),
          name: string(),
          description: string(),
        }),
      ),
    ).swagger,
  })
  async getLicensesTypes() {
    return await this.licenses.getLicensesTypes();
  }

  @ApiTags('Bussines', 'Licenses')
  @GetAll(
    {
      service: LicensesService,
    },
    'app',
  )
  async getActiveLicenses() {}

  @ApiTags('Bussines', 'Licenses')
  @CreateOne(
    {
      service: LicensesService,
    },
    'app',
  )
  async createLicense() {}

  @ApiTags('Bussines', 'Licenses')
  @UpdateOne(
    {
      service: LicensesService,
    },
    'app/:id',
  )
  async replaceLicense() {}

  @ApiTags('Bussines', 'Licenses')
  @DeleteOne(
    {
      service: LicensesService,
    },
    'app/:id',
  )
  async deleteLicense() {}

  @ApiTags('Bussines', 'Licenses')
  @AddRelation<LicensesService, LicensesEntity>(
    {
      service: LicensesService,
    },
    'coins',
    'app/:id/coins/:relation',
  )
  async addCoin() {}

  @ApiTags('Bussines', 'Licenses')
  @DeleteRelation<LicensesService, LicensesEntity>(
    {
      service: LicensesService,
    },
    'coins',
    'app/:id/coins/:relation',
  )
  async removeCoin() {}
}
