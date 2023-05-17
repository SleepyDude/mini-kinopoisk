import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Budget } from './budget.model';
import { BudgetFilms } from './budget.m2m.model';
import { Op } from 'sequelize';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(BudgetFilms) private budgetFilmsRepository: typeof BudgetFilms,
    @InjectModel(Budget) private budgetRepository: typeof Budget,
  ) {}

  async deleteBudgetByFilmId(filmId) {
    const budgetsId: any = await this.budgetFilmsRepository.findAll({
      raw: true,
      attributes: [['budgetId', 'id']],
      where: { filmId: filmId },
    });
    await this.budgetRepository.destroy({
      where: {
        [Op.or]: budgetsId,
      },
    });
    await this.budgetFilmsRepository.destroy({
      where: { filmId: filmId },
    });
    return 'Budgets has been delete';
  }
}
