export abstract class HasWhen<R> {
  public when(condition: boolean | undefined | null, callback: (query: R) => void): R {
    if (condition) {
      callback(this as unknown as R)
    }

    return this as unknown as R
  }
}
