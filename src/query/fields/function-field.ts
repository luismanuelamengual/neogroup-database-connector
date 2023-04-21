import { BasicField } from './basic-field';

export class FunctionField extends BasicField {

  private functionName: string;

  constructor(value: string)
  constructor(name: string, table: string)
  constructor(name: string, table: string, functionName: string)
  constructor() {
    if (arguments.length == 1) {
      const matchResult = arguments[0].match(/^(?<functionName>\S*)\s*\(\s*(?<field>\S*)\s*\)$/);
      if (matchResult) {
        const {functionName, field} = matchResult.groups;
        super(field);
        this.functionName = functionName;
      } else {
        super(arguments[0]);
      }
    } else {
      super(arguments[0], arguments[1]);
      if (arguments.length > 2) {
        this.functionName = arguments[2];
      }
    }
  }

  public setFunctionName(functionName: string) {
    this.functionName = functionName;
  }

  public getFunctionName(): string {
    return this.functionName;
  }
}