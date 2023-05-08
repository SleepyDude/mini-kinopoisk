import { CreateProfileDto, HttpRpcException, Profile, UpdateAvatarDto, UpdateProfileDto } from '@hotels2023nestjs/shared';
import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { catchError, firstValueFrom, Observable, of, switchMap } from 'rxjs';
// import { CreateProfileDto, RegisterProfileDto, UpdateProfileDto } from 'y/shared/dto';

import { DatabaseFilesService } from 'src/databaseFiles/files.service';

// import { ReturnProfile } from './types';

@Injectable()
export class ProfilesService {

    constructor(
        @InjectModel(Profile) private profileRepository: typeof Profile,
        // @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
        private fileService: DatabaseFilesService
    ) {}

    async createProfile(dto: CreateProfileDto): Promise<Profile> {
        const profile = await this.profileRepository.create(dto);
        if (dto.avatarId) {
            this.fileService.setAvatar(profile.id, dto.avatarId)
        }
        return 
    }

    async getAllProfiles() {
        return await this.profileRepository.findAll();
    }

    async getProfileByUserId(id: number): Promise<Profile> {
    
        const profile = await this.profileRepository.findOne({
            where: { user_id: id }
        });

        if (profile) return profile;
        
        throw new HttpRpcException('Профиль не найден', HttpStatus.NOT_FOUND);
    }

    async updateAvatar(id: number, dto: UpdateAvatarDto): Promise<Profile> {
        const profile = await this.getProfileByUserId(id);
        await this.fileService.unSetAvatar(profile.id);
        await this.fileService.setAvatar(profile.id, dto.avatarId)
        return await profile.update(dto);
    }

    async deleteAvatar(id: number): Promise<Profile> {
        const profile = await this.getProfileByUserId(id);
        await this.fileService.unSetAvatar(profile.id);
        return await profile.update({avatarId: null});
    }

    async updateProfileByUserId(id: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
        const profile = await this.getProfileByUserId(id);
        return await profile.update(updateProfileDto);
    }
}