import { Controller } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) {}

  @MessagePattern({ cmd: 'get-all-countries' })
  async getAllCountries() {
    return await this.countriesService.getAllCountries();
  }

  @MessagePattern({ cmd: 'get-country-byId' })
  async getCountryById(@Payload() countryId) {
    return await this.countriesService.getCountryById(countryId);
  }

  @MessagePattern({ cmd: 'update-country-byId' })
  async updateCountryById(@Payload() country) {
    return await this.countriesService.updateCountryById(country);
  }

  @MessagePattern({ cmd: 'delete-country' })
  async deleteCountryById(@Payload() countryId) {
    return await this.countriesService.deleteCountryById(countryId);
  }
}
