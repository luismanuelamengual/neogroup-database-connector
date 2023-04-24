import { BasicField, RawField } from '../fields';

export enum OrderByDirection {
  ASC = 'ASC',
  DESC = 'DESC'
};

export type OrderByField = RawField | BasicField & {direction?: OrderByDirection};

export abstract class HasOrderByFields<R> {

  protected _orderByFields: Array<OrderByField>;

  public setOrderByFields(orderByFields: Array<OrderByField>): R {
    this._orderByFields = orderByFields;
    return this as unknown as R;
  }

  public getOrderByFields(): Array<OrderByField> {
    return this._orderByFields;
  }

  public orderBy(field: OrderByField): R;
  public orderBy(field: RawField | BasicField, direction: OrderByDirection): R;
  public orderBy(field: OrderByField | BasicField, direction?: OrderByDirection): R {
    if (!this._orderByFields) {
      this._orderByFields = [];
    }
    let orderByField: OrderByField;
    if (direction) {
      if (typeof field === 'object') {
        orderByField = { name: field.name, table: field.table, direction };
      } else {
        orderByField = { name: field, direction };
      }
    } else {
      orderByField = field;
    }
    this._orderByFields.push(orderByField);
    return this as unknown as R;
  }
}
