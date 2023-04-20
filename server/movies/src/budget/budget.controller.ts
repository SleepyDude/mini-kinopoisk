import { Controller } from '@nestjs/common';
import {BudgetService} from "./budget.service";
import {MessagePattern, Payload} from "@nestjs/microservices";

@Controller('budget')
export class BudgetController {
    constructor(
        private budgetService: BudgetService,
    ) {}

    @MessagePattern({ cmd: 'create-budget' })
    createBudget(@Payload() budgets: []) {
        return this.budgetService.createBudget(budgets);
    }
}
