import { Controller } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  PersonsAutosagestGto,
  PersonsQueryDto,
  StaffQueryDto,
} from './dto/persons.query.dto';

@Controller('persons')
export class PersonsController {
  constructor(private personsService: PersonsService) {}

  @MessagePattern({ cmd: 'get-all-persons' })
  async getAllPersons(@Payload() params: PersonsQueryDto) {
    return await this.personsService.getAllPersons(params);
  }

  @MessagePattern({ cmd: 'get-person-byId' })
  async getPersonById(@Payload() id: number) {
    return await this.personsService.getPersonById(id);
  }

  @MessagePattern({ cmd: 'get-staff-by-filmId' })
  async getStaffByFilmId(@Payload() params: StaffQueryDto) {
    return await this.personsService.getStaffByFilmId(params);
  }

  @MessagePattern({ cmd: 'get-persons-autosagest' })
  async getPersonsAutosagest(@Payload() params: PersonsAutosagestGto) {
    return await this.personsService.getPersonsAutosagest(params);
  }

  @MessagePattern({ cmd: 'get-filmsId-byPersonId' })
  async getFilmsIdByPersonId(@Payload() personQuery) {
    return await this.personsService.getFilmsIdByPersonId(personQuery);
  }
}
