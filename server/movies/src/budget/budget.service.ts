import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Budget } from './budget.model';
import { BudgetFilms } from './budget.m2m.model';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(BudgetFilms) private budgetFilmsRepository: typeof BudgetFilms,
    @InjectModel(Budget) private budgetRepository: typeof Budget,
  ) {}

  async getBudgetById(budgetId: number) {
    return await this.budgetRepository.findOne({ where: { id: budgetId } });
  }
}
