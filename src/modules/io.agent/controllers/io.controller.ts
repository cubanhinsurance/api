import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  TECH_APPLICANT,
  TECH_APPLICANT_CANCELLED,
} from '../../bussines/io.constants';
import { AgentsIoService } from '../services/agents_io.service';

@Controller('io/agents')
export class AgentsIoController {
  constructor(private agentsIoService: AgentsIoService) {}

  @MessagePattern(TECH_APPLICANT)
  async tech_applicant(@Payload() data) {
    this.agentsIoService.emitNewTechApp(data);
  }

  @MessagePattern(TECH_APPLICANT_CANCELLED)
  async tech_applicant_cancelled(@Payload() data) {
    this.agentsIoService.emitTechAppCancelled(data);
  }
}
