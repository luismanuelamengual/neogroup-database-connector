export type OrderByDirection = 'ASC' | 'DESC';

export type OrderByField = string | [string, OrderByDirection] | {name: string, table?: string, schema?: string, direction?: OrderByDirection};

export abstract class HasOrderByFields<R> {

  protected _orderByFields: Array<OrderByField>;

  public setOrderByFields(orderByFields: Array<OrderByField>) {
    this._orderByFields = orderByFields;
  }

  public getOrderByFields(): Array<OrderByField> {
    return this._orderByFields;
  }

  public orderBy(...fields: Array<OrderByField>): R {
    if (!this._orderByFields) {
      this._orderByFields = [];
    }
    this._orderByFields.push(...fields);
    return this as unknown as R;
  }
}
