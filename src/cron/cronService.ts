import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entity/transactionEntity';
import { Repository, DataSource } from 'typeorm';
import { Count } from '../entity/countEntity';
import { setTimeout } from 'timers/promises';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Count)
    private countRepository: Repository<Count>,
    private dataSource: DataSource,
  ) {}

  @Cron('* * * * *')
  public async saveInformation() {
    const counter = await this.countRepository.findOne({ where: { id: 1 } });
    if (!counter) {
      throw new Error('No counter found in DB');
    }

    const dataTransaction = await fetch(
      `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x${counter.count.toString(16)}&boolean=true`,
    );

    await setTimeout(200);

    const dataLastBlockNumber = await fetch(
      'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber',
    );

    const resultLastBlockNumber = await dataLastBlockNumber.json();
    const blockNumber = resultLastBlockNumber.result;

    if (parseInt(blockNumber) < counter.count) {
      return;
    }

    await this.dataSource.transaction(async (em) => {
      const transactionRepo = em.getRepository(Transaction);
      const countRepo = em.getRepository(Count);

      const resultTransaction = await dataTransaction.json();
      const result = resultTransaction.result.transactions.map((el) => ({
        from: el.from,
        to: el.to,
        value: el.value,
        numberBlock: counter.count,
      }));

      await transactionRepo.save(result);
      await countRepo.save({ id: 1, count: counter.count + 1 });
    });
  }
}
