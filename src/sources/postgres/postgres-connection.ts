import {Connection} from '../../connection';
import {DataSet} from '../../data-set';

export class PostgresConnection extends Connection {
    
    public query(sql: string, bindings?: Array<any>): Promise<Array<DataSet>> {
        console.log(sql);
        console.log(bindings);
        return new Promise((resolve) => { resolve([] )});
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

    }

    public lastInsertedId(): any {
        return 0;
    }
}
