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
  GetOne,
} from '@atlasjs/typeorm-crud';
import { LicensesService } from '../services/licenses.service';
import j2s from 'joi-to-swagger';
import { array, number, object, string } from 'joi';
import { LicensesEntity } from '../entities/licenses.entity';
import { LicensesTypesService } from '../services/licenses_types.service';
@Controller('bussines/licenses')
export class LicensesController {
  constructor(
    private licenses: LicensesService,
    private licensesType: LicensesTypesService,
  ) {}

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

  @GetAll({
    service: LicensesTypesService,
  })
  async getLicenseTypes() {}

  @GetOne({
    service: LicensesTypesService,
  })
  async getLicenseType() {}

  @CreateOne({
    service: LicensesTypesService,
  })
  async createLicenseType() {}

  @UpdateOne({
    service: LicensesTypesService,
  })
  async updatetLicenseType() {}

  @DeleteOne({
    service: LicensesTypesService,
    softDelete: true,
  })
  async deleteLicenseType() {}
}
