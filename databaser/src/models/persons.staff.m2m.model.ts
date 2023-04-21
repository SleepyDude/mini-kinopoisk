import {Column, DataType, Model, Table} from "sequelize-typescript";

interface PersonsFilmsCreate {
    kinopoiskFilmId: number;
    personId: number;
    professionText: string;
    professionKey: string;
}

@Table({tableName: 'persons_films'})
export class PersonsFilms extends Model<PersonsFilms, PersonsFilmsCreate> {

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
    personId!: number;

    @Column({ type: DataType.STRING })
    professionText!: string;

    @Column({ type: DataType.STRING })
    professionKey!: string;

}