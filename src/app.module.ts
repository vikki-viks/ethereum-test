import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Transaction } from './entity/transactionEntity';
import { Count } from './entity/countEntity';
import { CronService } from './cron/cronService';
import { BalanceController } from './balance/balanceController';
import { BalanceService } from './balance/balanceService';
import { CreateDatabase1706636734237 } from './migrations/1706636734237-CreateDatabase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT!),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [Transaction, Count],
      migrations: [CreateDatabase1706636734237],
      migrationsRun: true,
      dropSchema: false,
    }),
    TypeOrmModule.forFeature([Transaction, Count]),
    ScheduleModule.forRoot(),
  ],
  providers: [CronService, BalanceService],
  controllers: [BalanceController],
  exports: [BalanceService],
})
export class AppModule {}
