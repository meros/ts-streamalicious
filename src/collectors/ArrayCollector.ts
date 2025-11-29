import * as types from "../types";

export default class ArrayCollector<T> implements types.Collector<T, T[]> {
  private result: T[] = [];

  public collectPart(part: T[] | null): types.CollectorCollectPartResult<T[]> {
    if (!part) {
      // I am done...
      return { done: true, value: this.result };
    }

    // Add to result array and keep going
    this.result = this.result.concat(part);
    return { done: false };
  }

  public getHints(): types.CollectorHints {
    return {
      needsValues: true,
      needsOrdering: true,
    };
  }
}
