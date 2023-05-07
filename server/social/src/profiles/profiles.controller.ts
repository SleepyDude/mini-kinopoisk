import { Controller, UseFilters } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
// import { DtoValidationPipe, HttpExceptionFilter, ObservableExceptionFilter, SharedService } from 'y/shared';
import { UpdateProfileDto } from '@hotels2023nestjs/shared';
import { ProfilesService } from './profiles.service';
import { ServiceRpcFilter } from '@hotels2023nestjs/shared';

@UseFilters(ServiceRpcFilter)
@Controller()
export class ProfilesController {
    constructor(
        private readonly profilesService: ProfilesService,
    ) {}

    @MessagePattern({ cmd: 'get-profiles' })
    async getProfiles() {
        return this.profilesService.getAllProfiles();
    }

    @MessagePattern({ cmd: 'create-profile' })
    async createProfile(
        @Payload() id: number,
    ) {
        console.log(`[social][profiles.controller][createProfile] id: ${id}`);
        return this.profilesService.createProfile(id);
    }

    @MessagePattern({ cmd: 'get-profile-by-user-id' })
    async getProfileByUserId(
        @Payload() id: number,
    ) {
        console.log(`[social][profiles.controller][get-profile-by-id] id: ${id}`);
        return this.profilesService.getProfileByUserId(id); 
    }

    @MessagePattern({ cmd: 'update-profile-by-user-id' })
    async updateProfileByUserId(
        @Payload('id') id: number,
        @Payload('dto') dto: UpdateProfileDto,
    ) {
        return this.profilesService.updateProfileByUserId(id, dto);
    }

}