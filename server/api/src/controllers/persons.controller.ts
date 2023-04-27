import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';
import { raw } from "express";
import { lastValueFrom } from "rxjs";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('Актеры и прочий состав')
@Controller('persons')
export class PersonsController {

    constructor(
      @Inject('PERSONS-SERVICE') private personsClient: ClientProxy,
      @Inject('MOVIES-SERVICE') private moviesService: ClientProxy,
    ) {}

    @ApiOperation({ summary: 'Получение всех персон, с пагинацией' })
    @ApiResponse({ status: 200, description: 'Выводи тсписок актеров с пагинацией' })
    @Get()
    getAllPersons(@Query() param) {
        return this.personsClient.send({ cmd: 'get-all-persons' }, param);
    }

    @ApiOperation({ summary: 'О персоне по айди' })
    @ApiResponse({ status: 200, description: 'Выводит всю информацию о актере по айди' })
    @Get('/about/:id')
    async getPersonById(@Param('id') id) {
        let person = await lastValueFrom(this.personsClient.send({ cmd: 'get-person-byId' }, id));
        let films = await lastValueFrom(this.moviesService.send({ cmd: 'get-films-byId-previous' }, person.filmsId));
        return {person: person.person, films};
    }
}