import {Controller} from '@nestjs/common';
import {CountriesService} from "./countries.service";
import {MessagePattern, Payload} from "@nestjs/microservices";

@Controller('countries')
export class CountriesController {
    constructor(
        private countriesService: CountriesService,
    ) {}

    @MessagePattern({ cmd: 'create-countries' })
    createCountry(@Payload() countries: []) {
        return this.countriesService.createCountry(countries);
    }
}
