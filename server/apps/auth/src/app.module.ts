import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from '@shared';

@Module({
  imports: [
    SharedModule.registerDatabase(process.env.POSTGRES_USERS_DB),
    // SequelizeModule.forRoot({
    //   dialect: 'postgres',
    //   host: process.env.POSTGRES_HOST,
    //   port: Number(process.env.POSTGRES_PORT_INSIDE),
    //   username: process.env.POSTGRES_USER,
    //   password: process.env.POSTGRES_PASSWORD,
    //   database: process.env.POSTGRES_USERS_DB,
    //   models: [],
    //   autoLoadModels: true,
    // }),
    AuthModule,
    TokensModule,
    RolesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
