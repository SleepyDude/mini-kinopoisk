import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({tableName: 'budget'})
export class Budget extends Model<Budget> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @Column({ type: DataType.STRING })
    type: string;

    @Column({ type: DataType.INTEGER })
    amount: number;

    @Column({ type: DataType.STRING })
    currencyCode: string;

    @Column({ type: DataType.STRING })
    name: string;

    @Column({ type: DataType.STRING })
    symbol: string;

}