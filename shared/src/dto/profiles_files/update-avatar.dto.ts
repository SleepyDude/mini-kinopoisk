import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class UpdateAvatarDto {
    @ApiProperty({ example: '1', description: 'ID аватара' })
    @IsNumber({}, {message: 'Должно быть числом'})
    readonly avatarId: number;
}