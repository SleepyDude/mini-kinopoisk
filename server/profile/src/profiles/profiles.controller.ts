import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create.profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private profileService: ProfilesService) {}

  @Post()
  createProfile(profileDto: CreateProfileDto) {
    return this.profileService.createProfile(profileDto);
  }

  @Get()
  getAllProfiles() {
    return this.profileService.getAllProfiles();
  }

  @Delete('/:id')
  deleteProfile(@Param() id) {
    return this.profileService.deleteProfile(id);
  }

  @Get('/:id')
  getProfileByUserId(@Param('id') id) {
    return this.profileService.getProfileByUserId(id);
  }

  @Put('/:id')
  updateProfileByUserId(@Param('id') id, @Body() profileDto: CreateProfileDto) {
    return this.profileService.updateProfileByUserId(id, profileDto);
  }
}
