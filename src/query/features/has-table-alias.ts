
export abstract class HasTableAlias<R> {

    protected tableAlias: string = "";

    public setTableAlias(tableAlias: string): R {
        this.tableAlias = tableAlias;
        return this as unknown as R;
    }

    public getTableAlias(): string {
        return this.tableAlias;
    }
}