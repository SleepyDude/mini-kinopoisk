import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from '@shared';

@Module({
  imports: [
    SharedModule.registerDatabase(process.env.POSTGRES_USERS_DB),
    AuthModule,
    TokensModule,
    RolesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
