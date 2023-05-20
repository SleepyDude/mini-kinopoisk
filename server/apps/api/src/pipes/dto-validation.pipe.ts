import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class DtoValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {

    const obj = plainToClass(metadata.metatype, value);
    const errors = await validate(obj);

    if (errors.length) {
      const record: object = {};
      errors.map((err) => {
        record[err.property] = Object.values(err.constraints).join(', ');
      });
      throw new HttpException(
        { validation_message: record },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
