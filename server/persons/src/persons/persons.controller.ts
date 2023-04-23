import { Controller, Get } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('persons')
export class PersonsController {
  constructor(private personsService: PersonsService) {}

  @MessagePattern({ cmd: 'get-persons' })
  @Get()
  get() {
    return 'hello';
  }

  @MessagePattern({ cmd: 'get-staff' })
  async getStaffByFilmId(@Payload() id) {
    return await this.personsService.getStaffByFilmId(id);
  }

  @MessagePattern({ cmd: 'get-person-by-id' })
  async getPersonById(@Payload() id) {
    return await this.personsService.getPersonById(id);
  }
}
