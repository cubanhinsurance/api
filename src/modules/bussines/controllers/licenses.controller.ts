/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetAll,
  CreateOne,
  UpdateOne,
  DeleteOne,
  AddRelation,
  DeleteRelation,
  GetOne,
} from 'nestjs-typeorm-crud';
import { LicensesService } from '../services/licenses.service';
import j2s from 'joi-to-swagger';
import * as joi from 'joi';
import { LicensesEntity } from '../entities/licenses.entity';
import { LicensesTypesService } from '../services/licenses_types.service';
import {
  BUY_LICENSE_SCHEMA,
  PAYMENT_EXECUTION_SCHEMA,
} from '../schemas/buyLicenses.schema';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { imageFilter } from 'src/lib/multer/filter';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  Page,
  PageSize,
} from 'src/lib/decorators/pagination_queries.decorator';

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
      joi.array().items(
        joi.object({
          id: joi.number(),
          name: joi.string(),
          description: joi.string(),
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
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFilter,
    }),
  )
  @UpdateOne<LicensesService>(
    {
      service: LicensesService,
      handler: 'updateLicense',
    },
    'app/:id',
  )
  async replaceLicense(@UploadedFile() photo) {}

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

  @ApiOperation({ description: 'Comprar una licencia' })
  @ApiTags('Bussines', 'Licenses')
  @ApiBody({
    schema: j2s(BUY_LICENSE_SCHEMA).swagger,
  })
  @Post('buy')
  async buyLicense(
    @User('username') user,
    @Body(new JoiPipe(BUY_LICENSE_SCHEMA)) { username, license, amount },
  ) {
    return await this.licenses.buyLicense(username ?? user, license, amount);
  }

  @ApiOperation({
    summary: 'Obtener todas las licencias para los usuarios',
  })
  @ApiTags('Bussines', 'UserLicenses')
  @ApiQuery({
    name: 'userOnly',
    description:
      'Define si solo se deben cargar las licencias activas del usuario',
    required: false,
  })
  @Get('users')
  async getUsersLicences(
    @User('username') user,
    @Query('userOnly', new JoiPipe(joi.boolean().optional())) userOnly,
  ) {
    return await this.licenses.getUsersLicences(user, userOnly);
  }

  @ApiOperation({ description: 'Ejecutar pago de licencia' })
  @ApiBody({
    schema: j2s(PAYMENT_EXECUTION_SCHEMA).swagger,
  })
  @Post('users/buy')
  @ApiOkResponse({ description: 'La operacion se inicio con exito' })
  @ApiNoContentResponse({ description: 'La operacion no se pudo ejecutar' })
  async executePayment(@Body(new JoiPipe(PAYMENT_EXECUTION_SCHEMA)) data) {
    return await this.licenses.executePayment(data);
  }

  @ApiOperation({ description: 'Verificar que se ejecuto una transaccion' })
  @Get('users/buy/:transaction_id')
  @ApiOkResponse({ description: 'La transaccion esta completada?' })
  @ApiNotFoundResponse({ description: 'La transaccion no existe' })
  async confirmPayment(@Param('transaction_id') transaction) {
    return await this.licenses.transactionConfirmed(transaction);
  }

  @ApiOperation({ description: 'Ver historial de transacciones del usuario' })
  @Get('users/history')
  async getLicensesHistory(
    @Page() page,
    @PageSize() page_size,
    @User('username') username,
  ) {
    return await this.licenses.getUserTransactions(username, page, page_size);
  }
}
