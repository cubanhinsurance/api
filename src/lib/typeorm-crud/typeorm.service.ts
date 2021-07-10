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

  get qr(): SelectQueryBuilder<Entity> {
    return this.repository.createQueryBuilder(this.alias);
  }

  async find(
    interceptor: QueryInterceptor = DefaultInterceptor,
  ): Promise<Entity[]> {
    const qr = this.qr;
    interceptor(qr);
    return await qr.getMany();
  }

  async findOne() {}

  async create() {}
}
