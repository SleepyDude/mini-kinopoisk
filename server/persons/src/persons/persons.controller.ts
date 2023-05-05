import { Controller } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('persons')
export class PersonsController {
  constructor(private personsService: PersonsService) {}

  @MessagePattern({ cmd: 'get-all-persons' })
  async getAllPersons(@Payload() params) {
    return await this.personsService.getAllPersons(params);
  }

  @MessagePattern({ cmd: 'get-staff-previous' })
  async getStaffByFilmIdPrevious(@Payload() id) {
    return await this.personsService.getStaffByFilmIdPrevious(id);
  }

  @MessagePattern({ cmd: 'get-person-byId' })
  async getPersonById(@Payload() id) {
    return await this.personsService.getPersonById(id);
  }

  @MessagePattern({ cmd: 'get-staff-by-filmId' })
  async getStaffByFilmId(@Payload() id) {
    return await this.personsService.getStaffByFilmId(id);
  }

  @MessagePattern({ cmd: 'get-persons-autosagest' })
  async getPersonsAutosagest(@Payload() params) {
    return await this.personsService.getPersonsAutosagest(params);
  }

  @MessagePattern({ cmd: 'get-filmsId-byPersonId' })
  async getFilmsIdByPersonId(@Payload() personQuery) {
    return await this.personsService.getFilmsIdByPersonId(personQuery);
  }
}
