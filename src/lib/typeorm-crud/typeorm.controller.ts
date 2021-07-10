import { Req } from '@nestjs/common';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { TypeOrmService } from './typeorm.service';

export class TypeOrmController<Entity> {
  constructor(readonly service: TypeOrmService<Entity>) {}
}
