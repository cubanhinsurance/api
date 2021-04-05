import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { Schema } from 'joi';

export class JoiPipe implements PipeTransform {
  constructor(private schema: Schema) {}
  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value, {
      convert: true,
    });

    if (error) {
      throw new BadRequestException(
        `${metadata.type}: ${
          metadata.data ? `"${metadata.data}"` : ''
        } validation failed: ${error.message}`,
      );
    }
    return value;
  }
}
