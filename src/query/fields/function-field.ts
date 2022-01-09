import {BasicField} from './basic-field';

export class FunctionField extends BasicField {
    
    private functionName: string;

    constructor(name: string, table?: string, functionName?: string) {
        super(name, table);
        this.functionName = functionName;
    }

    public setFunctionName(functionName: string) {
        this.functionName = functionName;
    }

    public getFunctionName(): string {
        return this.functionName;
    }
}