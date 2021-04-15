import { FindManyOptions, Repository } from 'typeorm';

export interface QUERY_PAGE {
  page: number;
  page_size: number;
  pages: number;
  total: number;
  next_page?: number;
  prev_page?: number;
  data: any[];
}

export const skip = (page, page_size): number => page_size * (page - 1);

export const paginate = (
  data: any[],
  page: number,
  page_size?: number,
  total?: number,
): QUERY_PAGE => {
  page_size = page_size ?? data.length;
  total = total ?? data.length;
  const pages = Math.ceil(total / page_size);
  return {
    page,
    page_size: Math.min(page_size, data.length),
    pages,
    total,
    prev_page: page === 1 ? null : page - 1,
    next_page: page < pages ? page + 1 : null,
    data,
  };
};

export const paginate_repo = async (
  page: number,
  page_size: number,
  repository: Repository<any>,
  options: FindManyOptions = {},
) => {
  options.take = page_size;
  options.skip = skip(page, page_size);
  const [data, count] = await repository.findAndCount(options);
  return paginate(data, page, page_size, count);
};
