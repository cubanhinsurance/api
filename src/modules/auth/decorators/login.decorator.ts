import { SetMetadata } from '@nestjs/common';

export const UPDATE_COOKIE = 'UPDATE_COOKIE';

export const SetCookie = (cookie: string) => SetMetadata(UPDATE_COOKIE, cookie);

export const SetAuthCookie = () => SetCookie('Authorization');
