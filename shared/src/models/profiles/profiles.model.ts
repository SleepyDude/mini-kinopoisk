import { ApiProperty } from '@nestjs/swagger';
import { Model, Table, Column, DataType } from 'sequelize-typescript';

interface ProfileAttrs {
    id: number;
    username: string;
    favMovie: string;
    avatarUrl: string;
    user_id: number;
};

interface ProfileCreationAttrs extends Pick<ProfileAttrs, 'user_id'> {}

@Table({ tableName: 'profiles' })
export class Profile extends Model<ProfileAttrs, ProfileCreationAttrs> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @ApiProperty({ example: 'Ubivashka666', description: 'Имя пользователя' })
    @Column({ type: DataType.STRING })
    username: string;

    @ApiProperty({ example: 'Пипец', description: 'Любимый фильм' })
    @Column({ type: DataType.STRING })
    favMovie: string;

    @ApiProperty({ example: 'http://fantastic-movies/images/random.jpg', description: 'url изображения профиля' })
    @Column({ type: DataType.STRING })
    avatarUrl: string;

    @ApiProperty({example: '42', description: 'id пользователя, который владеет данным профилем'}) 
    @Column({ type: DataType.INTEGER, unique: true, allowNull: false })
    user_id: number;
}