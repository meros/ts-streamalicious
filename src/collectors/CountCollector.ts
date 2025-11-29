import * as types from "../types";

export default class CountCollector<T> implements types.Collector<T, number> {
  private count: number = 0;

  public collectPart(part: T[] | null): types.CollectorCollectPartResult<number> {
    if (!part) {
      // I am done...
      return { done: true, value: this.count };
    }

    // Add to count and keep going!
    this.count += part.length;
    return { done: false };
  }

  public collectPartCount(count: number | null): types.CollectorCollectPartResult<number> {
    if (count === null) {
      // I am done...
      return { done: true, value: this.count };
    }

    // Add to count and keep going!
    this.count += count;
    return { done: false };
  }

  public getHints(): types.CollectorHints {
    // CountCollector doesn't need actual values or ordering - just counts
    return {
      needsValues: false,
      needsOrdering: false,
    };
  }
}
