import { TypeOrmEntityService, TypeOrmService } from '@atlasjs/typeorm-crud';
import { InjectRepository } from '@nestjs/typeorm';
import { LicensesTypesEntity } from 'src/modules/enums/entities/licenses_types.entity';

@TypeOrmEntityService({
  model: {
    type: LicensesTypesEntity,
    id: 'licensesType',
    name: 'Tipos de licencias',
  },
})
export class LicensesTypesService extends TypeOrmService<LicensesTypesEntity> {
  constructor(@InjectRepository(LicensesTypesEntity) repo) {
    super(repo);
  }
}
