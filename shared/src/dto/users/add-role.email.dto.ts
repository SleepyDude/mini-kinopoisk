import { IsEmail, IsInt, IsString } from "class-validator";

export class AddRoleDtoEmail {

    @IsEmail({}, { message: 'Необходим email' })
    readonly email: string;

    @IsString({ message: 'Должно быть строкой' })
    readonly roleName: string;
}