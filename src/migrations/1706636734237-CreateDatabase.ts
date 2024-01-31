import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDatabase1706636734237 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE transaction (
            id SERIAL PRIMARY KEY,
            "from" varchar(255),
            "to" varchar(255),
            value varchar(255),
            "numberBlock" int
          );
        CREATE TABLE count (
            id SERIAL PRIMARY KEY,
            count int
          );
          
        INSERT INTO "count" ("count") VALUES (19000000);
       `,
    );
    await queryRunner.query(``);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP table transaction;
    DROP table count;
    `);
  }
}
