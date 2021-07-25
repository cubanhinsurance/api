import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TECH_APPLICANT, TECH_APPLICANT_CONFIRMED } from '../io.constants';
import { AgentsIoService } from '../services/agents_io.service';
import { ClientsIoService } from '../services/clients_io.service';

@Controller('io')
export class IoController {
  constructor(
    private agentsIoService: AgentsIoService,
    private clientsIoService: ClientsIoService,
  ) {}

  @MessagePattern(TECH_APPLICANT)
  async tech_applicant(@Payload() data) {
    this.agentsIoService.emitNewTechApp(data);
  }

  @MessagePattern(TECH_APPLICANT_CONFIRMED)
  async tech_applicant_confirmed(@Payload() data) {
    this.clientsIoService.emitTechConfirmation(data);
  }
}
