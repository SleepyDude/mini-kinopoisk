import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUrl } from 'class-validator';

export class Path2File {
  @ApiProperty({
    example:
      '/app/server/social/dist/src/upload/48570b6c-24d5-458c-abd5-2088c47d90f5.jpg',
    description: 'Путь к файлу на сервере',
  })
  'path2File': string;
}

export class AvatarId {
  @ApiProperty({ example: '15', description: 'Внутренний ID аватара' })
  @IsInt({ message: 'Должно быть числом' })
  'avatarId': number;
}

export class Link {
  @ApiProperty({
    example:
      'https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_92x30dp.png',
    description: 'Ссылка на аватар',
  })
  @IsUrl(undefined, { message: 'Здесь должна быть ссылка' })
  'link': string;
}

export class AvatarPathId {
  @ApiProperty({
    example:
      '/app/server/social/dist/src/upload/48570b6c-24d5-458c-abd5-2088c47d90f5.jpg',
    description: 'Путь к файлу на сервере',
  })
  'path2File': string;

  @ApiProperty({ example: '15', description: 'Внутренний ID аватара' })
  @IsInt({ message: 'Должно быть числом' })
  'avatarId': number;
}
