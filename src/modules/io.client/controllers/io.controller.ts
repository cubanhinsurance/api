import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  NEW_ISSUE_APPLICATION,
  TECH_APPLICANT_CONFIRMED,
} from '../../bussines/io.constants';
import { ClientsIoService } from '../services/clients_io.service';

@Controller('io/clients')
export class ClientsIoController {
  constructor(private clientsIoService: ClientsIoService) {}

  @MessagePattern(TECH_APPLICANT_CONFIRMED)
  async tech_applicant_confirmed(@Payload() data) {
    this.clientsIoService.emitTechConfirmation(data);
  }

  @MessagePattern(NEW_ISSUE_APPLICATION)
  async new_issue_application(@Payload() data) {
    const a = 6;
    this.clientsIoService.newIssueApplication(data);
  }
}
