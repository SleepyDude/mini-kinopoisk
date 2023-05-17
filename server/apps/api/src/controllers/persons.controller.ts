import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { PersonsAutosagestDto, PersonsQueryDto } from '@shared/dto';
import { PersonByIdObjectInterface } from '@shared/interfaces';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с персонами из фильмов')
@Controller('persons')
export class PersonsController {
  constructor(
    @Inject('PERSONS-SERVICE') private personsClient: ClientProxy,
    @Inject('MOVIES-SERVICE') private moviesService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Получение всех персон, с пагинацией' })
  @ApiResponse({
    status: 200,
    description: 'Выводит список актеров с пагинацией',
  })
  @Get()
  getAllPersons(@Query(DtoValidationPipe) param: PersonsQueryDto) {
    return this.personsClient.send({ cmd: 'get-all-persons' }, param);
  }

  @ApiOperation({ summary: 'Информация о персоне по полю personId' })
  @ApiResponse({
    status: 200,
    description: 'Выводит всю информацию о актере по айди',
  })
  @Get('/about/:id')
  async getPersonById(@Param('id', ParseIntPipe) personId: number) {
    const person: PersonByIdObjectInterface = await lastValueFrom(
      this.personsClient.send({ cmd: 'get-person-byId' }, personId),
    );
    const films = await lastValueFrom(
      this.moviesService.send(
        { cmd: 'get-films-byId-previous' },
        person.filmsId,
      ),
    );
    return { person: person.person, films };
  }

  @ApiOperation({ summary: 'Автосаджест по персонам' })
  @ApiResponse({
    status: 200,
    description: 'Выводит имена и айди актеров по квери параметрам',
  })
  @Get('/search')
  async getPersonsAutosagest(
    @Query(DtoValidationPipe) params: PersonsAutosagestDto,
  ) {
    return this.personsClient.send({ cmd: 'get-persons-autosagest' }, params);
  }
}
