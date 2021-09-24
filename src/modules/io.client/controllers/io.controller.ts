import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PENDENT_ISSUE } from 'src/modules/bussines/services/issues_cache.service';
import {
  CLIENT_ISSUE_IN_PROGRESS_UPDATE,
  ISSUE_APPLICATION_CANCELLED,
  ISSUE_PAUSED,
  NEW_ISSUE_APPLICATION,
  TECH_APPLICANT_CONFIRMED,
  TECH_ARRIVED,
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
  async new_issue_application(@Payload() { issue, application }) {
    this.clientsIoService.newIssueApplication(issue, application);
  }

  @MessagePattern(ISSUE_APPLICATION_CANCELLED)
  async onissueCancelled(@Payload() application) {
    this.clientsIoService.issueApplicationCancelled(application);
  }

  @MessagePattern(CLIENT_ISSUE_IN_PROGRESS_UPDATE)
  async issueUpdate(@Payload() update: PENDENT_ISSUE) {
    this.clientsIoService.issueUpdate(update);
  }

  @MessagePattern(ISSUE_PAUSED)
  async issuePaused(@Payload() data) {
    this.clientsIoService.issuePaused(data);
  }

  @MessagePattern(TECH_ARRIVED)
  async issueArrived(@Payload() data) {
    this.clientsIoService.issueArrived(data);
  }
}
