import { array, number, object, string } from 'joi';

export const FunctionalitiesSchema = object({
  name: string().required().description('Nombre'),
  description: string().optional().description('Descripcion'),
  id: number().required(),
});

export const FunctionalitiesList = array().items(FunctionalitiesSchema);
