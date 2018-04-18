import * as types from "../types";

export default class ArrayStreamable<T> implements types.Streamable<T> {
  private array: T[];

  constructor(array: T[]) {
    this.array = array;
  }

  public requestPart(callback: types.Consumer<T[]>): void {
    var array = this.array;
    this.array = null;
    callback(array);
  }
}
