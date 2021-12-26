
export abstract class HasDistinct<R> {
    
    protected distinct: boolean = false;

    public setDistinct(distinct: boolean): R {
        this.distinct = distinct;
        return this as unknown as R;
    }

    public isDistinct(): boolean {
        return this.distinct;
    }
}