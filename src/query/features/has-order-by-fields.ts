import { OrderByField } from '../fields';

export abstract class HasOrderByFields<R> {

  protected _orderByFields: Array<OrderByField>;

  public setOrderByFields(orderByFields: Array<OrderByField>) {
    this._orderByFields = orderByFields;
  }

  public getOrderByFields(): Array<OrderByField> {
    return this._orderByFields;
  }

  public orderBy(...fields: Array<OrderByField | string>): R {
    if (!this._orderByFields) {
      this._orderByFields = [];
    }
    for (const field of fields) {
      let orderByField: OrderByField;
      if (field instanceof OrderByField) {
        orderByField = field;
      } else if (typeof field === 'string') {
        orderByField = new OrderByField(field);
      }
      this._orderByFields.push(orderByField);
    }
    return this as unknown as R;
  }
}
