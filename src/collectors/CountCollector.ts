import * as types from "../types";

export default class CountCollector<T> implements types.Collector<T, number> {
  private count: number = 0;

  public collectPart(part: T[]): types.CollectorCollectPartResult<number> {
    if (!part) {
      // I am done...
      return { done: true, value: this.count };
    }

    // Add to count and keep going!
    this.count += part.length;
    return { done: false };
  }
}
