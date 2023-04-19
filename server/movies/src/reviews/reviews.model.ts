import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({tableName: 'reviews'})
export class Reviews extends Model<Reviews> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @Column({ type: DataType.INTEGER })
    kinopoiskFilmId: number;

    @Column({ type: DataType.INTEGER })
    parentId: number;

    @Column({ type: DataType.INTEGER })
    userId: number;

    @Column({ type: DataType.STRING })
    name: string;

    @Column({ type: DataType.TEXT })
    text: string;

}