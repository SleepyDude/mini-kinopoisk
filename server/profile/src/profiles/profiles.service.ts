import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create.profile.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Profiles } from './profles.model';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profiles) private profileRepository: typeof Profiles,
  ) {}

  async createProfile(profileDto: CreateProfileDto) {
    return await this.profileRepository.create(profileDto);
  }

  async getAllProfiles() {
    return await this.profileRepository.findAll();
  }

  async deleteProfile(id) {
    const profile = await this.profileRepository.findOne({ where: { id: id } });
    return profile.destroy();
  }

  async getProfileByUserId(id) {
    return await this.profileRepository.findOne({ where: { userId: id } });
  }

  async updateProfileByUserId(id, profileDto) {
    const profile = await this.profileRepository.findOne({
      where: { userId: id },
    });
    return await profile.update(profileDto);
  }
}
