import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';


export class CreateReviewDto {

    @ApiProperty({ example: '13', description: 'id фильма на странице которого находится комментарий' })
    @IsInt({ message: 'Должно быть целым числом'})
    readonly film_id: number;
    
    @ApiProperty({ example: '4', description: 'id комментария родителя' })
    @IsInt({ message: 'Должно быть целым числом'})
    @IsOptional()
    readonly parent_id: number;

    @ApiProperty({ example: 'Ужасный филем', description: 'Заголовок' })
    @IsString({ message: 'Должно быть строкой'})
    @IsOptional()
    readonly title: string;

    @ApiProperty({ example: 'Мне очень не понравилось, 0/10', description: 'Текст комментария' })
    @IsString({ message: 'Должно быть строкой'})
    readonly text: string;

    @ApiProperty({ example: '1.3.8.', description: 'Значение свойства "path" родительского комментария' })
    @IsString({ message: 'Должно быть строкой'})
    @IsOptional()
    readonly parentPath: string;

}