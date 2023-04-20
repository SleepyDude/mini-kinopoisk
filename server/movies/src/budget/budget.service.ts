import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Budget} from "./budget.model";
import {BudgetFilms} from "./budget.m2m.model";

@Injectable()
export class BudgetService {
    constructor(
        @InjectModel(Budget) private budgetRepository: typeof Budget,
        @InjectModel(BudgetFilms) private budgetFilmsRepository: typeof BudgetFilms,
    ) {}

    async createBudget(budgets) {
        for ( let budget of budgets.items ) {
            let currentBudget = await this.budgetRepository.create(budget);
            await this.budgetFilmsRepository.create({ kinopoiskFilmId: budgets.filmId, budgetId: currentBudget.id });
        }
    }
}
