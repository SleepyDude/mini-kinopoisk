import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({tableName: 'persons'})
export class Persons extends Model<Persons> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @Column({ type: DataType.INTEGER })
    personId: number;

    @Column({ type: DataType.STRING })
    nameRu: string;

    @Column({ type: DataType.STRING })
    nameEng: string;

    @Column({ type: DataType.STRING })
    sex: string;

    @Column({ type: DataType.STRING })
    posterUrl: string;

    @Column({ type: DataType.STRING })
    birthday: string;

    @Column({ type: DataType.STRING })
    death: string;

    @Column({ type: DataType.INTEGER })
    age: number;

    @Column({ type: DataType.STRING })
    birthPlace: string;

    @Column({ type: DataType.STRING })
    deathPlace: string;

    @Column({ type: DataType.STRING })
    hasAwards: string;

    @Column({ type: DataType.STRING })
    profession: string;

}