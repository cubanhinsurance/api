import { NotImplementedException } from '@nestjs/common';
import {
  FindManyOptions,
  getRepository,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { DefaultInterceptor, QueryInterceptor } from './typeorm.interfaces';

export class TypeOrmService<Entity = any> {
  constructor(public readonly repository: Repository<Entity>) {}

  get alias(): string {
    return 'entity';
  }

  qr(
    interceptor: QueryInterceptor = DefaultInterceptor,
    ...args
  ): SelectQueryBuilder<Entity> {
    const qr = this.repository.createQueryBuilder(this.alias);
    if (interceptor) interceptor(qr, ...args);
    return qr;
  }

  async find(interceptor?: QueryInterceptor): Promise<Entity[]> {
    return await this.qr(interceptor).getMany();
  }

  async findOne(id: any, interceptor?: QueryInterceptor) {
    const pk = this.repository.metadata.primaryColumns;
    if (pk.length == 1) {
      return await this.qr(interceptor, id).andWhereInIds(id).getOne();
    } else {
      //todo implement for multiple pks
      throw new NotImplementedException();
    }
  }

  async createOne() {}
}
