import { ApiProperty } from '@nestjs/swagger';

export class HttpExceptionResponse {
  @ApiProperty({ example: '400', description: 'HTTP код' })
  statusCode: number;

  @ApiProperty({
    example: 'Недостаточно прав',
    description: 'Сообщение об ошибке, строка или объект',
  })
  error: string | object;
}

export class CustomHttpExceptionResponse extends HttpExceptionResponse {
  @ApiProperty({
    example: '/api/reviews/tree/16',
    description: 'Путь по которому был получен запрос',
  })
  path: string;

  @ApiProperty({
    example: 'GET',
    description: 'Метод, который использовался для запроса',
  })
  method: string;

  @ApiProperty({
    example: '2023-05-19T12:03:54.001Z',
    description: 'Время запроса',
  })
  timeStamp: Date;
}
