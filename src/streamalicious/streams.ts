import * as types from "./types";
import Stream from "./Stream";

class ArrayStreamable<T> implements types.Streamable<T> {
  private array: T[];

  constructor(array: T[]) {
    this.array = array;
  }

  public requestPart(callback: types.Consumer<T[]>) {
    var array = this.array;
    this.array = null;
    callback(array);
  }
}

export function fromArray<T>(array: T[]): Stream<T> {
  return new Stream<T>(new ArrayStreamable(array));
}

class SleepIncrementerStreamable implements types.Streamable<number> {
  private value: number = 0;
  private maxValue: number;

  constructor(maxValue: number) {
    this.maxValue = maxValue;
  }

  public requestPart(callback: types.Consumer<number[]>) {
    var currentValue = this.value++;
    if (currentValue > 100) {
      callback(null);
    } else {
      setTimeout(() => {
        callback([currentValue]);
      }, Math.random() * 1000);
    }
  }
}

export function debugSleepIncremeneter(maxValue: number): Stream<number> {
  return new Stream<number>(new SleepIncrementerStreamable(maxValue));
}
