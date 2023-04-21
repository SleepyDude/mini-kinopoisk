import {Column, DataType, Model, Table} from "sequelize-typescript";

interface GenresCreation {
    genreNameRu: string;
}

@Table({tableName: 'genres'})
export class Genres extends Model<Genres, GenresCreation> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id!: number;

    @Column({ type: DataType.STRING })
    genreNameRu!: string;

    @Column({ type: DataType.STRING })
    genreNameEng!: string;

}