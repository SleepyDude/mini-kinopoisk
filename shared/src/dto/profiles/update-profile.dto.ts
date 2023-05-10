import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateProfileDto {
    
    @ApiProperty({ example: 'Ubivashka666', description: 'Имя пользователя' })
    @IsString({ message: 'Должно быть строкой' })
    @IsOptional()
    readonly username: string;

    
    @ApiProperty({ example: 'http://fantastic-movies/images/random.jpg', description: 'url изображения профиля' })
    // @IsUrl({}, { message: 'Должно быть валидным адресом' })
    @IsOptional()
    readonly avatarUrl: string;

    @ApiProperty({ example: 'Пипец', description: 'Любимый фильм' })
    @IsString({ message: 'Должно быть строкой' })
    @IsOptional()
    readonly favMovie: string;

}