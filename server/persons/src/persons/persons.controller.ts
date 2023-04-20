import {Controller, Get} from '@nestjs/common';
import {PersonsService} from "./persons.service";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CreatePersonDto} from "./dto/create.person.dto";

@Controller('persons')
export class PersonsController {

    constructor(private personsService: PersonsService) {}

    @MessagePattern({ cmd: 'get-persons' })
    @Get()
    get() {
        return 'hello';
    }

    @MessagePattern({ cmd: 'create-staff' })
    createStaff(@Payload() staff) {
        return this.personsService.createStaff(staff);
    }

    @MessagePattern({ cmd: 'create-person' })
    createPerson(@Payload() person: CreatePersonDto) {
        return this.personsService.createPerson(person);
    }
}
