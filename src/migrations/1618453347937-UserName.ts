import {MigrationInterface, QueryRunner} from "typeorm";

export class UserName1618453347937 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('user', 'fullName', 'name');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('user', 'name', 'fullName');
    }

}
