import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateProfileDto {
  @ApiProperty({example: 'Ivanov', description: 'Surname'})
  @IsString({message: 'Value must be a type of String'})
  lastName: string;

  @ApiProperty({example: 'Ivan', description: 'Name'})
  @IsString({message: 'Value must be a type of String'})
  firstName: string;

  @ApiProperty({example: '+79999999999', description: 'Phone number'})
  @IsString({message: 'Value must be a type of String'})
  telNumber: string;
}
