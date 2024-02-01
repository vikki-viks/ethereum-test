import { Controller, Get } from '@nestjs/common';
import { BalanceService } from './balanceService';

@Controller()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get('/balance')
  async getBalance() {
    return await this.balanceService.highestChangedBalance();
  }
}
