import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class AddRoleDtoEmail {

    @ApiProperty({ example: 'user@mail.ru', description: 'Email пользователя, которому добавляется роль' })
    @IsEmail({}, { message: 'Необходим email' })
    readonly email: string;

    @ApiProperty({ example: 'ADMIN', description: 'Имя роли, которая добавляется пользователю' })
    @IsString({ message: 'Должно быть строкой' })
    readonly roleName: string;
}