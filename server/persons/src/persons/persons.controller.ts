import {Controller, Get} from '@nestjs/common';
import {PersonsService} from "./persons.service";
import {MessagePattern} from "@nestjs/microservices";

@Controller('persons')
export class PersonsController {

    constructor(private personsService: PersonsService) {}

    @MessagePattern({ cmd: 'get-persons' })
    @Get()
    get() {
        return 'hello';
    }
}
