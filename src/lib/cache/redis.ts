import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/common';

export const RedisCacheModule = (
  host: string,
  port: number = 6379,
  ttl?: number,
  max?: number, //MemoryCacheModule(ttl, max);
) =>
  CacheModule.register({
    store: redisStore as any,
    host,
    port,
    ttl: ttl ?? null,
    max,
  });
