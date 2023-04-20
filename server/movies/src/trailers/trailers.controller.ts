import { Controller } from '@nestjs/common';
import {TrailersService} from "./trailers.service";
import {MessagePattern, Payload} from "@nestjs/microservices";

@Controller('trailers')
export class TrailersController {
    constructor(
        private trailersService: TrailersService,
    ) {}

    @MessagePattern({ cmd: 'create-trailer' })
    createTrailer(@Payload() trailers) {
        return this.trailersService.createTrailer(trailers);
    }
}
