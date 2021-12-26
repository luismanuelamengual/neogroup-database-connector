
export abstract class HasTable<R> {

    protected tableName: string = "";

    public setTableName(tableName: string): R {
        this.tableName = tableName;
        return this as unknown as R;
    }

    public getTableName(): string {
        return this.tableName;
    }
}