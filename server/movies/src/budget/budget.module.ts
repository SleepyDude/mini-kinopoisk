import { Module } from '@nestjs/common';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {Budget} from "./budget.model";
import {BudgetFilms} from "./budget.m2m.model";

@Module({
  controllers: [BudgetController],
  providers: [BudgetService],
  imports: [SequelizeModule.forFeature([Budget, BudgetFilms])],
  exports: [
      BudgetService,
  ]
})
export class BudgetModule {}
