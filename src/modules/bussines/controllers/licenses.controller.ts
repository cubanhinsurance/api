/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
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
import { BUY_LICENSE_SCHEMA } from '../schemas/buyLicenses.schema';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { imageFilter } from 'src/lib/multer/filter';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFilter,
    }),
  )
  @CreateOne<LicensesService>(
    {
      service: LicensesService,
      handler: 'createLicense',
    },
    'app',
  )
  async createLicense(@UploadedFile() photo) {}

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

  @ApiTags('Bussines', 'LicensesTypes')
  @GetAll({
    service: LicensesTypesService,
  })
  async getLicenseTypes() {}

  @ApiTags('Bussines', 'LicensesTypes')
  @GetOne({
    service: LicensesTypesService,
  })
  async getLicenseType() {}

  @ApiTags('Bussines', 'LicensesTypes')
  @CreateOne({
    service: LicensesTypesService,
  })
  async createLicenseType() {}

  @ApiTags('Bussines', 'LicensesTypes')
  @UpdateOne({
    service: LicensesTypesService,
  })
  async updatetLicenseType() {}

  @ApiTags('Bussines', 'LicensesTypes')
  @DeleteOne({
    service: LicensesTypesService,
    softDelete: true,
  })
  async deleteLicenseType() {}

  @ApiTags('Bussines', 'Licenses')
  @Post('buy')
  async buyLicense(
    @User('username') user,
    @Body(new JoiPipe(BUY_LICENSE_SCHEMA)) { username, license, amount },
  ) {
    return await this.licenses.buyLicense(username ?? user, license, amount);
  }
}
