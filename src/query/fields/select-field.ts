import { FunctionField } from './function-field';

export class SelectField extends FunctionField {

  private alias: string;

  constructor(name: string, table?: string, functionName?: string, alias?: string) {
    super(name, table, functionName);
    this.alias = alias;
  }

  public setAlias(alias: string) {
    this.alias = alias;
  }

  public getAlias(): string {
    return this.alias;
  }
}
