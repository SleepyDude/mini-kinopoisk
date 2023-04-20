import { Module } from '@nestjs/common';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Token } from './tokens.model';

@Module({
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
  imports: [SequelizeModule.forFeature([ Token ])]
})
export class TokensModule {}
