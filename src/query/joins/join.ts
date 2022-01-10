import {ConditionGroup, Condition} from '../conditions';
import {JoinType} from './join-type';
import {Field, BasicField} from '../fields';

export class Join {

    private table: string;
    private alias: string;
    private type: JoinType
    private conditionGroup: ConditionGroup = new ConditionGroup();

    constructor(type: JoinType, table: string);
    constructor(type: JoinType, table: string, sourceField: BasicField | string, remoteField: BasicField | string);
    constructor(type: JoinType, table: string, sourceField: BasicField | string, remoteField: BasicField | string, alias: string);
    constructor(type: JoinType, table: string, sourceField?: BasicField | string, remoteField?: BasicField | string, alias?: string) {
        this.type = type;
        this.table = table;
        if (sourceField && remoteField) {
            this.on(sourceField, remoteField instanceof BasicField ? remoteField : new BasicField(remoteField));
        }
        if (alias) {
            this.alias = alias;
        }
    }

    public setTable(table: string): Join {
        this.table = table;
        return this;
    }

    public getTable(): string {
        return this.table;
    }

    public setAlias(alias: string): Join {
        this.alias = alias;
        return this;
    }

    public getAlias(): string {
        return this.alias;
    }

    public setType(type: JoinType): Join {
        this.type = type;
        return this;
    }

    public getType(): JoinType {
        return this.type;
    }

    public setCondtionGroup(conditionGroup: ConditionGroup): Join {
        this.conditionGroup = conditionGroup;
        return this;
    }

    public getConditionGroup(): ConditionGroup {
        return this.conditionGroup;
    }

    public on(sql: string): Join;
    public on(condition: Condition): Join;
    public on(sql: string, bindings: Array<any>): Join;
    public on(field: Field, value: any): Join;
    public on(field: string, value: any): Join;
    public on(field: {name: string, table?: string, functionName?: string}, value: any): Join;
    public on(field: Field, operator: string, value: any): Join;
    public on(field: string, operator: string, value: any): Join;
    public on(field: {name: string, table?: string, functionName?: string}, operator: string, value: any): Join;
    public on(): Join {
        // @ts-ignore
        this.conditionGroup.with(...arguments);
        return this;
    }
}
