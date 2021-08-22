import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ISSUE_CREATED,
  NEW_ISSUE_APPLICATION,
} from 'src/modules/bussines/io.constants';
import { TechsIoService } from '../services/techs_io.service';

@Controller('io/techs')
export class TechsIoController {
  constructor(private techsIoService: TechsIoService) {}

  @MessagePattern(ISSUE_CREATED)
  async issue_created(@Payload() data) {
    this.techsIoService.issueCreated(data);
  }

  // @MessagePattern(NEW_ISSUE_APPLICATION)
  // async issue_application(@Payload() data) {
  //   this.techsIoService.newApplication(data);
  // }
}
