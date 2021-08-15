import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ISSUE_CREATED,
  TECH_APPLICANT,
  TECH_APPLICANT_CANCELLED,
  TECH_APPLICANT_CONFIRMED,
} from '../io.constants';
import { AgentsIoService } from '../services/agents_io.service';
import { ClientsIoService } from '../services/clients_io.service';
import { IssuesCacheService } from '../services/issues_cache.service';
import { TechsIoService } from '../services/techs_io.service';

@Controller('io')
export class IoController {
  constructor(
    private agentsIoService: AgentsIoService,
    private clientsIoService: ClientsIoService,
    private techsIoService: TechsIoService,
  ) {}

  @MessagePattern(TECH_APPLICANT)
  async tech_applicant(@Payload() data) {
    this.agentsIoService.emitNewTechApp(data);
  }

  @MessagePattern(TECH_APPLICANT_CONFIRMED)
  async tech_applicant_confirmed(@Payload() data) {
    this.clientsIoService.emitTechConfirmation(data);
  }

  @MessagePattern(TECH_APPLICANT_CANCELLED)
  async tech_applicant_cancelled(@Payload() data) {
    this.agentsIoService.emitNewTechApp(data);
  }

  @MessagePattern(ISSUE_CREATED)
  async issue_created(@Payload() data) {
    this.techsIoService.issueCreated(data);
  }
}
