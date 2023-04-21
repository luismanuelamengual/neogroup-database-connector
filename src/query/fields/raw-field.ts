import { Field } from './field';

export class RawField extends Field {
  private sql: string;

  constructor(sql: string) {
    super();
    this.sql = sql;
  }

  public setSql(sql: string) {
    this.sql = sql;
  }

  public getSql(): string {
    return this.sql;
  }
}
