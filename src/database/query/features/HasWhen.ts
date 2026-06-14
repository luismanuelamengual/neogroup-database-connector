export abstract class HasWhen<R> {
  public when(condition: any, callback: (query: R) => void): R {
    if (condition) {
      callback(this as unknown as R)
    }

    return this as unknown as R
  }
}
