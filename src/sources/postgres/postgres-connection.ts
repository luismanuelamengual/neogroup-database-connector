require('../../connection');
require('../../data-set');

class PostgresConnection extends Connection {
    
    public query(sql: string, values?: Array<any>): Promise<Array<DataSet>> {
        console.log('Executing sql: ' + sql);
        return new Promise((resolve) => { resolve([] )});
    }

    public execute(sql: string, values?: Array<any>): Promise<number> {
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
