import { Controller } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('budget')
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @MessagePattern({ cmd: 'delete-budget-by-filmId' })
  async deleteBudgetByFilmId(@Payload() filmId) {
    return await this.budgetService.deleteBudgetByFilmId(filmId);
  }
}
