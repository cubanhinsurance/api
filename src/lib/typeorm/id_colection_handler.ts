import { In, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

export const handleNumberArr = async (
  arr: any[],
  repo: Repository<any>,
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
