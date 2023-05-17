import { ApiProperty } from '@nestjs/swagger';

export class Token {
  @ApiProperty({
    example: 'eyJhbGciO...yJV_adQssw5c',
    description: 'JWT Access токен доступа',
  })
  'token': string;
}

export class TokenId extends Token {
  @ApiProperty({ example: '4', description: 'id пользователя' })
  'id': number;
}

export class TokenEmail extends Token {
  @ApiProperty({ example: 'user@mail.ru', description: 'email пользователя' })
  'email': string;
}

export class TokenEmailId extends TokenEmail {
  @ApiProperty({ example: '4', description: 'id пользователя' })
  'id': number;
}
