import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class AddRoleDto {

    @ApiProperty({ example: '2', description: 'ip пользователя, которому добавляется роль' })
    @IsInt({ message: 'Должно быть числом' })
    readonly userId: number;

    @ApiProperty({ example: 'ADMIN', description: 'Имя роли, которая добавляется пользователю' })
    @IsString({ message: 'Должно быть строкой' })
    readonly roleName: string;
}
