import {Connection} from '../../connection';
import {DataSet} from '../../data-set';

export class PostgresConnection extends Connection {
    
    private client: any;

    constructor(client: any) {
        super();
        this.client = client;
    }

    public async query(sql: string, bindings?: Array<any>): Promise<Array<DataSet>> {
        const response = await this.client.query(sql, bindings);
        return response.rows;
    }

    public execute(sql: string, bindings?: Array<any>): Promise<number> {
        console.log(sql);
        console.log(bindings);
        return new Promise((resolve) => { resolve(0)});
    }

    public beginTransaction(): void {
    }

    public rollbackTransaction(): void {
    }

    public commitTransaction(): void {
    }

    public close(): void {
        this.client.release();
    }

    public lastInsertedId(): any {
        return 0;
    }
}
