import {Controller, Get} from '@nestjs/common';
import {PersonsService} from "./persons.service";
import {MessagePattern, Payload} from "@nestjs/microservices";

@Controller('persons')
export class PersonsController {

    constructor(private personsService: PersonsService) {}

    @MessagePattern({ cmd : 'get-persons' })
    @Get()
    get() {
        return 'hello';
    }

    @MessagePattern({ cmd : 'get-staff' })
    getStaffByFilmId(@Payload() id) {
        return this.personsService.getStaffByFilmId(id);
    }

    @MessagePattern({ cmd : 'get-person-by-id' })
    getPersonById(@Payload() id) {
        return this.personsService.getPersonById(id);
    }
}
