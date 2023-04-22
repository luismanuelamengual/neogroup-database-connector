import { BasicField } from '../fields';
import { Join, JoinType } from '../joins';

export abstract class HasJoins<R> {

  protected _joins: Array<Join>;

  public getJoins(): Array<Join> {
    if (!this._joins) {
      this._joins = [];
    }
    return this._joins;
  }

  public setJoins(joins: Array<Join>): R {
    this._joins = joins;
    return this as unknown as R;
  }

  public join(join: Join): R;
  public join(type: JoinType, table: string, sourceField: BasicField | string, remoteField: BasicField | string): R;
  public join(type: JoinType, table: string, sourceField: BasicField | string, remoteField: BasicField | string, alias: string): R;
  public join(type: JoinType, table: string, sourceField?: BasicField | string, remoteField?: BasicField | string, alias?: string): R
  public join(): R {
    let join: Join;
    if (arguments.length === 1) {
      join = arguments[0];
    } else {
      // @ts-ignore
      join = new Join(...arguments);
    }
    this.getJoins().push(join);
    return this as unknown as R;
  }

  public innerJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string): R;
  public innerJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string, alias: string): R;
  public innerJoin(table: string, sourceField?: BasicField | string, remoteField?: BasicField | string, alias?: string): R
  public innerJoin(): R {
    // @ts-ignore
    this.getJoins().push(new Join(JoinType.INNER_JOIN, ...arguments));
    return this as unknown as R;
  }

  public leftJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string): R;
  public leftJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string, alias: string): R;
  public leftJoin(table: string, sourceField?: BasicField | string, remoteField?: BasicField | string, alias?: string): R
  public leftJoin(): R {
    // @ts-ignore
    this.getJoins().push(new Join(JoinType.LEFT_JOIN, ...arguments));
    return this as unknown as R;
  }

  public rightJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string): R;
  public rightJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string, alias: string): R;
  public rightJoin(table: string, sourceField?: BasicField | string, remoteField?: BasicField | string, alias?: string): R
  public rightJoin(): R {
    // @ts-ignore
    this.getJoins().push(new Join(JoinType.RIGHT_JOIN, ...arguments));
    return this as unknown as R;
  }

  public outerJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string): R;
  public outerJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string, alias: string): R;
  public outerJoin(table: string, sourceField?: BasicField | string, remoteField?: BasicField | string, alias?: string): R
  public outerJoin(): R {
    // @ts-ignore
    this.getJoins().push(new Join(JoinType.OUTER_JOIN, ...arguments));
    return this as unknown as R;
  }

  public crossJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string): R;
  public crossJoin(table: string, sourceField: BasicField | string, remoteField: BasicField | string, alias: string): R;
  public crossJoin(table: string, sourceField?: BasicField | string, remoteField?: BasicField | string, alias?: string): R
  public crossJoin(): R {
    // @ts-ignore
    this.getJoins().push(new Join(JoinType.CROSS_JOIN, ...arguments));
    return this as unknown as R;
  }
}
