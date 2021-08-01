import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CREATE_USER_LOCATION_SCHEMA,
  UPDATE_USER_LOCATION_SCHEMA,
  USERS_LOCATIONS_SCHEMA,
} from '../schemas/locations.schema';
import j2s from 'joi-to-swagger';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { LocationsService } from '../services/locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Post('user')
  @ApiTags('UserLocations')
  @ApiOperation({
    description: 'Crea una ubicacion(casa/pto de interes) de un cliente',
  })
  @ApiBody({
    schema: j2s(CREATE_USER_LOCATION_SCHEMA).swagger,
  })
  async createUserLocations(
    @User('username') username: string,
    @Body(new JoiPipe(CREATE_USER_LOCATION_SCHEMA, true, ['geom'])) data,
  ) {
    await this.locationsService.createLocation(username, data);
  }

  @Put('user/:locationId')
  @ApiTags('UserLocations')
  @ApiOperation({
    description: 'Actualiza una ubicacion(casa/pto de interes) de un cliente',
  })
  @ApiBody({
    schema: j2s(UPDATE_USER_LOCATION_SCHEMA).swagger,
  })
  async updateUserLocations(
    @User('username') username: string,
    @Param('locationId') id: number,
    @Body(new JoiPipe(UPDATE_USER_LOCATION_SCHEMA, true, ['geom'])) data,
  ) {
    await this.locationsService.updateLocation(username, id, data);
  }

  @Delete('user/:locationId')
  @ApiTags('UserLocations')
  @ApiOperation({
    description: 'Elimina una ubicacion(casa/pto de interes) de un cliente',
  })
  async deleteUserLocations(
    @User('username') username: string,
    @Param('locationId') id: number,
  ) {
    await this.locationsService.removeUserLocation(username, id);
  }

  @Get('user')
  @ApiTags('UserLocations')
  @ApiOperation({
    description: 'Devuelve las ubicaciones de un usuario',
  })
  @ApiOkResponse({
    schema: j2s(USERS_LOCATIONS_SCHEMA).swagger,
  })
  async getUserLocations(@User('username') username: string) {
    return await this.locationsService.getUserLocations(username);
  }
}
