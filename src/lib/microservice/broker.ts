import { ConfigService } from 'nestjs-rconfig-module';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const REDIS_BROKER = ClientsModule.registerAsync([
  {
    name: 'BROKER',
    useFactory() {
      return {
        options: {
          host: 'redis',
          retryDelay: 10000,
          retryAttempts: 100,
        },
        transport: Transport.REDIS,
      };
    },
  },
]);
