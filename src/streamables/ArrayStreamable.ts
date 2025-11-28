import * as types from "../types";

export default class ArrayStreamable<T> implements types.Streamable<T> {
  private array: T[] | null;

  constructor(array: T[] | null) {
    this.array = array;
  }

  public requestPart(callback: types.Consumer<T[] | null>): void {
    const array = this.array;
    this.array = null;
    callback(array);
  }
}
