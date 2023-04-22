import { BasicField } from './basic-field';

export type OrderByDirection = 'ASC' | 'DESC';

export class OrderByField extends BasicField {

  private direction: OrderByDirection;

  constructor(name: string, table?: string, direction: OrderByDirection = 'ASC') {
    super(name, table);
    this.direction = direction;
  }

  public setDirection(direction: OrderByDirection) {
    this.direction = direction;
  }

  public getDirection(): OrderByDirection {
    return this.direction;
  }
}
