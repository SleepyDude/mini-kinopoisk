import {Body, Controller, Get, Post} from '@nestjs/common';
import {ParserService} from "./parser.service";

@Controller('parser')
export class ParserController {

    constructor(
        private parserService: ParserService,
    ) {}

    @Get('/test')
    async parserStart() {
         await this.parserService.parserStart();
    }

    @Get()
    test() {
        return 'Hello there';
    }
}