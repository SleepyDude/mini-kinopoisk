import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthVKDto {
  @ApiProperty({ example: 'eyJhbGciO...yJV_adQssw5c', description: 'Vk-code' })
  // @IsString({ message: 'Необходимо передать VK код в виде строки' })
  code: string;
}
