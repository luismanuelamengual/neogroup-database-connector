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
}
