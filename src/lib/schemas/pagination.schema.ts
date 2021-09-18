import * as joi from 'joi';

export const PAGE_RESULT_SCHEMA = joi.object({
  page: joi.number().min(1).integer().description('Pagina actual'),
  page_size: joi.number().integer().description('Tamaño de pagina'),
  total: joi.number().integer().description('Total de elementos'),
  pages: joi.number().integer().description('Total de paginas'),
  prev_page: joi.number().integer().optional().description('Pagina anterior'),
  next_page: joi.number().integer().optional().description('Pagina siguiente'),
  data: joi.array(),
});
