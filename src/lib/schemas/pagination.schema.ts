import { array, number, object } from 'joi';

export const PAGE_RESULT_SCHEMA = object({
  page: number().min(1).integer().description('Pagina actual'),
  page_size: number().integer().description('Tamaño de pagina'),
  total: number().integer().description('Total de elementos'),
  pages: number().integer().description('Total de paginas'),
  prev_page: number().integer().optional().description('Pagina anterior'),
  next_page: number().integer().optional().description('Pagina siguiente'),
  data: array(),
});
