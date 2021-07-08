/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';
import { LicensesService } from '../services/licenses.service';

@Controller('bussines/licenses')
export class LicensesController {
  constructor(private licensesService: LicensesService) {}

  @Get('types')
  async getLicensesTypes() {
    return await this.licensesService.getLicensesTypes();
  }

  @Get('app')
  async getUsersLicenses() {
    return await this.licensesService.getLicenses();
  }
}
