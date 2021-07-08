import { EntityRepository, Repository } from 'typeorm';

export class TypeOrmRepo<T> extends Repository<T> {
  constructor() {
    super();
    const a = 7;
  }
  async findAll() {
    const a = 6;
  }
}
