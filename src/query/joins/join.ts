import {ConditionGroup} from "../conditions";
import {JoinType} from "./join-type";

export class Join extends ConditionGroup {

    private table: string;
    private alias: string;
    private type: JoinType
    
    constructor(table: string);
    constructor(table: string, alias: string);
    constructor(table: string, type: JoinType);
    constructor(table: string, alias: string, type: JoinType);
    constructor(table: string, aliasOrtype?: string | JoinType, type?: JoinType) {
        super();
        this.table = table;
        if (aliasOrtype) {
            if (typeof aliasOrtype === 'string') {
                this.alias = aliasOrtype;
            } else {
                this.type = aliasOrtype;        
            }
        }
        if (type) {
            this.type = type;
        }
    }

    public setTable(table: string) {
        this.table = table;
    }

    public getTable(): string {
        return this.table;
    }

    public setAlias(alias: string) {
        this.alias = alias;
    }

    public getAlias(): string {
        return this.alias;
    }

    public setType(type: JoinType) {
        this.type = type;
    }

    public getType(): JoinType {
        return this.type;
    }
}
