import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module';

import { DatabaseFilesModule } from './databaseFiles/files.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SharedModule } from '@shared';

@Module({
  imports: [
    ProfilesModule,
    ReviewsModule,
    DatabaseFilesModule,
    SharedModule.registerDatabase(process.env.POSTGRES_SOCIAL_DB),
    SharedModule.registerRmq('AUTH-SERVICE', process.env.AUTH_QUEUE),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
