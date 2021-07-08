import { FindOneOptions, In, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export const handleNumberArr = async <T>(
  arr: any[],
  repo: Repository<T>,
  message: string = 'Missing:',
  idfield: string = 'id',
) => {
  const matches = await repo.find({
    [idfield]: In(arr),
  });

  if (matches.length != arr.length) {
    const bad = arr.filter((s) => !matches.find((m) => m[idfield] == s));
    if (typeof message != 'undefined')
      throw new BadRequestException(`${message} ${bad.join(', ')}`);
  } else return matches;
};

export const handleIdsCommaString = async (
  ids: string,
  repo: Repository<any>,
  message: string = 'Missing:',
  idfield: string = 'id',
) => await handleNumberArr(ids.split(','), repo, message, idfield);

export const findOrFail = async <T>(
  condition: string | number | FindOneOptions<T>,
  repo: Repository<T>,
) => {
  const r = await repo.findOne(condition as any);
  if (!r) throw new NotFoundException(`${repo.metadata.name}: no encontrado/a`);
  return r;
};
