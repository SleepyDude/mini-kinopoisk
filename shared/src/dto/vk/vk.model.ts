import { ApiProperty } from "@nestjs/swagger";

export class AuthVK {
    @ApiProperty({ example: 'eyJhbGciO...yJV_adQssw5c', description: 'Vk-code' })
    code: string;
  } 
  