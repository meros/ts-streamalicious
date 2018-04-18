import * as types from "./types";

class CountCollector<T> implements types.Collector<T, number> {
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

class ArrayCollector<T> implements types.Collector<T, T[]> {
  private result: T[] = [];

  public collectPart(part: T[]): types.CollectorCollectPartResult<T[]> {
    if (!part) {
      // I am done...
      return { done: true, value: this.result };
    }

    // Add to result array and keep going
    this.result = this.result.concat(part);
    return { done: false };
  }
}

class JoiningCollector implements types.Collector<string, string> {
  private seperator: string;
  private result: string;

  public collectPart(part: string[]): types.CollectorCollectPartResult<string> {
    if (!part) {
      // I am done...
      return { done: true, value: this.result };
    }

    var partLength = part.length;
    for (var i = 0; i < partLength; i++) {
      let subPart = part[i];
      // Add to result array and keep going
      if (!!this.result) {
        this.result += this.seperator + subPart;
      } else {
        this.result = subPart;
      }
    }

    return { done: false };
  }

  constructor(seperator: string) {
    this.seperator = seperator;
    this.result = "";
  }
}

export function toCount<T>() {
  return new CountCollector<T>();
}

export function toArray<T>() {
  return new ArrayCollector<T>();
}

export function toJointString(seperator: string) {
  return new JoiningCollector(seperator);
}
