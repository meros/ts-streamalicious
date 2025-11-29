import * as types from "../types";

export default class FirstCollector<T> implements types.Collector<T, T | undefined> {
  private result: T | undefined = undefined;
  private found: boolean = false;

  public collectPart(part: T[] | null): types.CollectorCollectPartResult<T | undefined> {
    // Defensive check: if already found, return cached result
    // This shouldn't happen with normal framework usage since we return done=true,
    // but provides safety if collectPart is called directly by external code
    if (this.found) {
      return { done: true, value: this.result };
    }

    if (!part) {
      // Stream ended without finding any element
      return { done: true, value: undefined };
    }

    if (part.length > 0) {
      // Found first element - signal done immediately
      this.result = part[0];
      this.found = true;
      return { done: true, value: this.result };
    }

    // Empty part, keep going
    return { done: false };
  }
}
