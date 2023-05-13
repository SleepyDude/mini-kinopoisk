import {
  CreateProfileDto,
  HttpRpcException,
  UpdateAvatarDto,
  UpdateProfileDto,
} from '@hotels2023nestjs/shared';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DatabaseFilesService } from 'src/databaseFiles/files.service';
// import { Review } from 'src/reviews/reviews.model';
import { Profile } from '../../models/profiles.model';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile) private profileRepository: typeof Profile,
    private fileService: DatabaseFilesService,
  ) {}

  async createProfile(dto: CreateProfileDto): Promise<Profile> {
    // console.log(`[dto] == ${JSON.stringify(dto)}`)
    const profile = await this.profileRepository.create(dto);
    // console.log(`[profile created]`)
    if (dto.avatarId) {
      await this.fileService.setAvatar(profile.id, dto.avatarId);
    }
    return profile;
  }

  async getAllProfiles() {
    return await this.profileRepository.findAll();
  }

  async getProfileByUserId(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user_id: id },
    });

    if (profile) return profile;

    throw new HttpRpcException('Профиль не найден', HttpStatus.NOT_FOUND);
  }

  async updateAvatar(id: number, dto: UpdateAvatarDto): Promise<Profile> {
    const profile = await this.getProfileByUserId(id);
    await this.fileService.unSetAvatar(profile.id);
    await this.fileService.setAvatar(profile.id, dto.avatarId);
    return await profile.update(dto);
  }

  async deleteAvatar(id: number): Promise<Profile> {
    const profile = await this.getProfileByUserId(id);
    await this.fileService.unSetAvatar(profile.id);
    return await profile.update({ avatarId: null });
  }

  async updateProfileByUserId(
    id: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.getProfileByUserId(id);
    return await profile.update(updateProfileDto);
  }
}
