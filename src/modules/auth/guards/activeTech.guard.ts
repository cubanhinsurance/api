import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TechsIoService } from 'src/modules/io/services/techs_io.service';

@Injectable()
export class ValidTechLicense implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
