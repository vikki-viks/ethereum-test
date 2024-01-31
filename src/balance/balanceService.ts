import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entity/transactionEntity';
import { Repository, MoreThan } from 'typeorm';
import { Count } from '../entity/countEntity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Count)
    private countRepository: Repository<Count>,
  ) {}

  async highestBalance() {
    const counter = await this.countRepository.findOne({ where: { id: 1 } });

    const transaction = await this.transactionRepository.find({
      where: { numberBlock: MoreThan(counter.count - 100) },
    });

    const result = transaction.map((el) => ({
      value: parseInt(el.value),
      from: el.from,
      to: el.to,
    }));

    const map = await this.createMapOfTransaction(result);

    return Math.max(...map.values());
  }

  private async createMapOfTransaction(result) {
    const map = new Map();

    for (const el of result) {
      if (map.has(el.from)) {
        const balance = map.get(el.from);
        const newBalance = balance - el.value;
        map.set(el.from, newBalance);
      } else {
        map.set(el.from, -el.value);
      }
      if (map.has(el.to)) {
        const balance = map.get(el.to);
        const newBalance = balance + el.value;
        map.set(el.from, newBalance);
      } else {
        map.set(el.to, el.value);
      }
    }
    return map;
  }
}
