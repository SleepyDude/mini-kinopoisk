import { Controller, UseFilters } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ServiceRpcFilter } from '@shared';
import {
  PersonsAutosagestDto,
  PersonsQueryDto,
  StaffQueryDto,
} from '@shared/dto';

@Controller('persons')
export class PersonsController {
  constructor(private personsService: PersonsService) {}

  @MessagePattern({ cmd: 'get-all-persons' })
  async getAllPersons(@Payload() params: PersonsQueryDto) {
    return await this.personsService.getAllPersons(params);
  }

  @UseFilters(ServiceRpcFilter)
  @MessagePattern({ cmd: 'get-person-byId' })
  async getPersonById(@Payload() personId: number) {
    return await this.personsService.getPersonById(personId);
  }

  @MessagePattern({ cmd: 'get-staff-by-filmId' })
  async getStaffByFilmId(@Payload() params: StaffQueryDto) {
    return await this.personsService.getStaffByFilmId(params);
  }

  @MessagePattern({ cmd: 'get-persons-autosagest' })
  async getPersonsAutosagest(@Payload() params: PersonsAutosagestDto) {
    return await this.personsService.getPersonsAutosagest(params);
  }

  @MessagePattern({ cmd: 'get-filmsId-byPersonId' })
  async getFilmsIdByPersonId(@Payload() personQuery) {
    return await this.personsService.getFilmsIdByPersonId(personQuery);
  }
}
