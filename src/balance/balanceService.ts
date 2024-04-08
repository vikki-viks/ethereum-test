import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entity/transactionEntity';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Count } from '../entity/countEntity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Count)
    private countRepository: Repository<Count>,
  ) {}

  async highestChangedBalance() {
    const counter = await this.countRepository.findOne({ where: { id: 1 } });

    if (!counter) {
      throw new Error('No counter found in DB');
    }

    const transaction = await this.transactionRepository.find({
      where: { numberBlock: MoreThanOrEqual(counter.count - 100) },
    });

    const transactionsWithBase10Value = transaction.map((el) => ({
      value: parseInt(el.value),
      from: el.from,
      to: el.to,
    }));

    const balanceMap = await this.createBalanceMap(transactionsWithBase10Value);

    console.log([...balanceMap.entries()]);

    const [address] = [...balanceMap.entries()].reduce(
      ([accAddress, accBalance]: [string, number], [address, balance]) => {
        if (Math.abs(balance) > Math.abs(accBalance)) {
          return [address, balance];
        }
        return [accAddress, accBalance];
      },
    );

    return address;
  }

  private async createBalanceMap(
    transactions: {
      value: number;
      from: string;
      to: string;
    }[],
  ) {
    const result = new Map<string, number>();

    for (const el of transactions) {
      if (result.has(el.from)) {
        const balance = result.get(el.from);
        const newBalance = balance! - el.value;
        result.set(el.from, newBalance);
      } else {
        result.set(el.from, -el.value);
      }

      if (result.has(el.to)) {
        const balance = result.get(el.to);
        const newBalance = balance! + el.value;
        result.set(el.to, newBalance);
      } else {
        result.set(el.to, el.value);
      }
    }

    return result;
  }
}
