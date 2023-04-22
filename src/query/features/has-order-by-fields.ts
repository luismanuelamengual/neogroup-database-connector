import { OrderByField } from '../fields';

export abstract class HasOrderByFields<R> {

  protected orderByFields: Array<OrderByField>;

  public orderBy(...fields: Array<OrderByField | string>): R {
    if (!this.orderByFields) {
      this.orderByFields = [];
    }
    for (const field of fields) {
      let orderByField: OrderByField;
      if (field instanceof OrderByField) {
        orderByField = field;
      } else if (typeof field === 'string') {
        orderByField = new OrderByField(field);
      }
      this.orderByFields.push(orderByField);
    }
    return this as unknown as R;
  }

  public setOrderByFields(orderByFields: Array<OrderByField>) {
    this.orderByFields = orderByFields;
  }

  public getOrderByFields(): Array<OrderByField> {
    return this.orderByFields;
  }

  public clearOrderByFields(): R {
    this.orderByFields = [];
    return this as unknown as R;
  }
}
