import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from 'models/roles.model';

@Module({
  providers: [RolesService],
  controllers: [RolesController],
  imports: [SequelizeModule.forFeature([Role])],
  exports: [
    RolesService, // Добавляем, чтобы иметь возможность импортировать сервис в другой модуль, в данном случае - в модуль Users
  ],
})
export class RolesModule {}
