import { UpdateProfileDto } from '@hotels2023nestjs/shared';
import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { catchError, firstValueFrom, Observable, of, switchMap } from 'rxjs';
// import { CreateProfileDto, RegisterProfileDto, UpdateProfileDto } from 'y/shared/dto';
import { Profile } from '@hotels2023nestjs/shared';
// import { ReturnProfile } from './types';

@Injectable()
export class ProfilesService {

    constructor(
        @InjectModel(Profile) private profileRepository: typeof Profile,
        @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    ) {}

    async createProfile(id: number) {
        return this.profileRepository.create({user_id: id});
    }

    private async findProfileByUserId(id: number): Promise<Profile> {
        const profile = this.profileRepository.findOne({ where: {user_id: id} });
        if (profile) return profile;
        throw new HttpException('Профиль не найден', HttpStatus.NOT_FOUND);
    }

    async getAllProfiles() {
        return await this.profileRepository.findAll();
    }

    async getProfileByUserId(id: number): Promise<Profile> {
    
        const profile = await this.profileRepository.findOne({
            where: { user_id: id }
        });

        return profile;
    }

    async updateProfileByUserId(id: number, updateProfileDto: UpdateProfileDto) {
        
        const profile = await this.findProfileByUserId(id);

        await profile.update(updateProfileDto);
        return profile
    }

}