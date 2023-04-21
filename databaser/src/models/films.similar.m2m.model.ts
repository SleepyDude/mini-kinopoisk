import {Column, DataType, Model, Table} from "sequelize-typescript";

interface SimilarFilmsCreation {
    kinopoiskId: number;
    similarFilmId: number;
}

@Table({tableName: 'similar_films'})
export class SimilarFilms extends Model<SimilarFilms, SimilarFilmsCreation> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id!: number;

    @Column({ type: DataType.INTEGER })
    kinopoiskId!: number;

    @Column({ type: DataType.INTEGER })
    similarFilmId!: number;

}