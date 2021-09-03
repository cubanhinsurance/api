import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ISSUE_CANCELLED,
  ISSUE_CREATED,
  NEW_ISSUE_APPLICATION,
  TECH_ACCEPTED,
  TECH_REJECTED,
} from 'src/modules/bussines/io.constants';
import { TechsIoService } from '../services/techs_io.service';

@Controller('io/techs')
export class TechsIoController {
  constructor(private techsIoService: TechsIoService) {}

  @MessagePattern(ISSUE_CREATED)
  async issue_created(@Payload() data) {
    this.techsIoService.issueCreated(data);
  }

  @MessagePattern(ISSUE_CANCELLED)
  async issue_cancelled(@Payload() data) {
    this.techsIoService.issueCancelled(data);
  }

  @MessagePattern(TECH_REJECTED)
  async techRejected(@Payload() data) {
    this.techsIoService.techRejected(data);
  }

  @MessagePattern(TECH_ACCEPTED)
  async techAccepted(@Payload() data) {
    this.techsIoService.techAccepted(data);
  }

  // @MessagePattern(NEW_ISSUE_APPLICATION)
  // async issue_application(@Payload() data) {
  //   this.techsIoService.newApplication(data);
  // }
}
