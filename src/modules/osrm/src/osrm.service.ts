import { Inject, Injectable } from '@nestjs/common';
import { OsrmModuleOptions } from './osrm.module';

@Injectable()
export class OsrmService {
  constructor(@Inject('OSRM_OPTIONS') private options: OsrmModuleOptions) {}

  
}
