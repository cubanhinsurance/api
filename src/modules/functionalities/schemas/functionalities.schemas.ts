import * as joi from 'joi';

export const FunctionalitiesSchema = joi.object({
  name: joi.string().required().description('Nombre'),
  description: joi.string().optional().description('Descripcion'),
  id: joi.number().required(),
});

export const FunctionalitiesList = joi.array().items(FunctionalitiesSchema);
