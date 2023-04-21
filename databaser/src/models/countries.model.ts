import {Column, DataType, Model, Table} from "sequelize-typescript";

interface CountriesCreation {
    countryNameRu: string;
}

@Table({tableName: 'countries'})
export class Countries extends Model<Countries, CountriesCreation> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id!: number;

    @Column({ type: DataType.STRING })
    countryNameRu!: string;

    @Column({ type: DataType.STRING })
    countryNameEng!: string;
}