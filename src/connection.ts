import {DataSet} from './data-set';

export abstract class Connection {

    public abstract query(sql: string, bindings?: Array<any>): Promise<Array<DataSet>>;

    public abstract execute(sql: string, bindings?: Array<any>): Promise<number>;

    public abstract beginTransaction(): Promise<void>;

    public abstract rollbackTransaction(): Promise<void>;

    public abstract commitTransaction(): Promise<void>;

    public abstract close(): Promise<void>;

    public async executeTransaction(transaction: () => Promise<void>) {
        await this.beginTransaction();
        try {
            await transaction();
            await this.commitTransaction();
        } catch (e) {
            await this.rollbackTransaction();
        }
    }
}
