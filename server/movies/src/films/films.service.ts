import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Films } from './films.model';
import { CountriesService } from '../countries/countries.service';
import { GenresService } from '../genres/genres.service';
import { BudgetService } from '../budget/budget.service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Op } from 'sequelize';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('MOVIES-SERVICE') private usersClient: ClientProxy,
    @InjectModel(Films) private filmsRepository: typeof Films,
  ) {}
  async getAllFilms(params) {
    const { page, size, field, value } = params;
    const condition = value ? { [field]: { [Op.iLike]: `%${value}%` } } : null;
      const { limit, offset } = this.getPagination(page, size);

    return await this.filmsRepository.findAndCountAll({
      where: condition,
      limit,
      offset,
    });
  }

  async getFilmById(id) {
    return await this.filmsRepository.findOne({
      include: { all: true },
      where: { id: id.id },
    });
  }

  private getPagination(page, size) {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  }
}
