import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Countries } from './countries.model';
import { CountriesFilms } from './countries.m2m.model';
import { UpdateCountryDto } from '@hotels2023nestjs/shared';

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Countries) private countriesRepository: typeof Countries,
    @InjectModel(CountriesFilms)
    private countriesFilmsRepository: typeof CountriesFilms,
  ) {}

  async getCountryById(countryId: number) {
    return await this.countriesRepository.findOne({ where: { id: countryId } });
  }

  async getAllCountries() {
    return await this.countriesRepository.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    });
  }

  async updateCountryById(country) {
    const countryDto: UpdateCountryDto = country.country;
    const currentCountry = await this.countriesRepository.findOne({
      where: { id: country.id },
    });
    await currentCountry.update(countryDto);
    return currentCountry;
  }

  async deleteCountryById(countryId) {
    const country = await this.countriesRepository.findOne({
      where: { id: countryId },
    });
    return country.destroy();
  }
}
