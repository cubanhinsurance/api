import { HttpStatus } from '@nestjs/common';

export class Exception extends Error {
  constructor(
    message: string,
    public code: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
  }
}
