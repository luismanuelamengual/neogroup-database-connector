require('./data-object');

abstract class Connection {

    public abstract query(sql: string, values?: Array<any>): Promise<Array<DataObject>>;

    public abstract execute(sql: string, values?: Array<any>): number;

    public abstract beginTransaction(): void;

    public abstract rollbackTransaction(): void;

    public abstract commitTransaction(): void;

    public abstract close(): void;
}
