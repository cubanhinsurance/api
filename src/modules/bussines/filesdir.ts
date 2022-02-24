import { existsSync, mkdirSync, statSync } from 'fs';

export const directory = () => {
  const env = process.env?.['WHOFIX_PHOTOS'];
  if (!env) throw new Error(`Missing envvar: "WHOFIX_PHOTOS"`);
  return env;
};

export const checkPhotosDir = async () => {
  const dir = directory();
  const exists = existsSync(dir);
  if (!exists) {
    mkdirSync(dir);
  }
  const stats = statSync(dir);
  if (!stats.isDirectory()) {
    throw new Error(`Directorio: ${dir}, no es un directorio !!!`);
  }
};
