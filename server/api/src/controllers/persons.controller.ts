import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from "rxjs";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FiltersProfessionQuery } from "../types/filters.query.enum";

@ApiTags('Актеры и прочий состав')
@Controller('persons')
export class PersonsController {

    constructor(
      @Inject('PERSONS-SERVICE') private personsClient: ClientProxy,
      @Inject('MOVIES-SERVICE') private moviesService: ClientProxy,
    ) {}

    @ApiQuery({ name: 'page' })
    @ApiQuery({ name: 'size' })
    @ApiOperation({ summary: 'Получение всех персон, с пагинацией' })
    @ApiResponse({ status: 200, description: 'Выводи тсписок актеров с пагинацией' })
    @Get()
    getAllPersons(@Query() param) {
        return this.personsClient.send({ cmd: 'get-all-persons' }, param);
    }

    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'О персоне по айди' })
    @ApiResponse({ status: 200, description: 'Выводит всю информацию о актере по айди' })
    @Get('/about/:id')
    async getPersonById(@Param('id') id) {
        let person = await lastValueFrom(this.personsClient.send({ cmd: 'get-person-byId' }, id));
        let films = await lastValueFrom(this.moviesService.send({ cmd: 'get-films-byId-previous' }, person.filmsId));
        return {person: person.person, films};
    }

    @ApiQuery({ name: 'profession', enum: FiltersProfessionQuery, description: 'Актер или режиссер' })
    @ApiQuery({ name: 'name', description: 'Только русское имя' })
    @ApiOperation({ summary: 'Автосаджест по персонам' })
    @ApiResponse({ status: 200, description: 'Выводит имена и айди актеров по квери параметрам' })
    @Get('/search')
    async getPersonsAutosagest(@Query() params) {
        return this.personsClient.send({ cmd: 'get-persons-autosagest' }, params);
    }
}