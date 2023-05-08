import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Countries } from './countries.model';
import { CountriesFilms } from './countries.m2m.model';
import { UpdateCountryDto } from '@hotels2023nestjs/shared';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Countries) private countriesRepository: typeof Countries,
    @InjectModel(CountriesFilms)
    private countriesFilmsRepository: typeof CountriesFilms,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCountryById(countryId: number) {
    const cache = await this.cacheManager.get(
      `getCountryById${JSON.stringify(countryId)}`,
    );
    if (cache) {
      return cache;
    }
    return await this.countriesRepository
      .findOne({ where: { id: countryId } })
      .then(async (result) => {
        await this.cacheManager.set(
          `getCountryById${JSON.stringify(countryId)}`,
          result,
        );
        return result;
      });
  }

  async getAllCountries() {
    const cache = await this.cacheManager.get(`getAllCountries`);
    if (cache) {
      return cache;
    }
    return await this.countriesRepository
      .findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      })
      .then(async (result) => {
        await this.cacheManager.set(`getAllCountries`, result);
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
