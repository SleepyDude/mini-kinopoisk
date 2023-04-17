import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsEmail, Length } from "class-validator"

export class CreateUserDto { 
    @ApiProperty({example: 'name@post.com', description: 'e-mail address'})
    @IsString({message: 'Value must be a type of String'})
    @IsEmail({}, {message: 'E-mail is incorrect'})
    email: string;

    @ApiProperty({example: '******', description: 'Secret password'})
    @IsString({message: 'Value must be a type of String'})
    @Length(4, 16, {message: 'Password must be more than 4 symbols and less than 16.'})
    password: string;

}
