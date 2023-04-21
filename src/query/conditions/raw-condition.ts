import { Condition } from './condition';

export class RawCondition extends Condition {

  private sql: string;
  private bindings: Array<any>;

  constructor(sql: string, bindings?: Array<any>) {
    super();
    this.sql = sql;
    this.bindings = bindings;
  }

  public setSql(sql: string) {
    this.sql = sql;
  }

  public getSql(): string {
    return this.sql;
  }

  public setBindings(bindings: Array<any>) {
    this.bindings = bindings;
  }

  public getBindings(): Array<any> {
    return this.bindings;
  }
}
