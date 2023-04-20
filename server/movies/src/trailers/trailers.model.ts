import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({tableName: 'trailers'})
export class Trailers extends Model<Trailers> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @Column({ type: DataType.INTEGER })
    kinopoiskFilmId: number;

    @Column({ type: DataType.STRING })
    url: string;

    @Column({ type: DataType.STRING })
    name: string;

    @Column({ type: DataType.STRING })
    site: string;
}