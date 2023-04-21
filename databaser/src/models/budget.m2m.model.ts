import {Column, DataType, Model, Table} from "sequelize-typescript";

interface BudgetFilmsCreation {
    kinopoiskFilmId: number;
    budgetId: number;
}

@Table({tableName: 'budget_films'})
export class BudgetFilms extends Model<BudgetFilms, BudgetFilmsCreation> {

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
    budgetId!: number;

}