import {Column, DataType, Model, Table} from "sequelize-typescript";

interface GenresFilmsCreation {
    kinopoiskFilmId: number;
    genreId: number;
}

@Table({tableName: 'genres_films'})
export class GenresFilms extends Model<GenresFilms, GenresFilmsCreation> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id!: number;

    @Column({ type: DataType.INTEGER })
    kinopoiskFilmId!: number;

    @Column({ type: DataType.INTEGER })
    genreId!: number;

}