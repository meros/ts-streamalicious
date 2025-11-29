import * as types from "../types";

export default class JoiningCollector implements types.Collector<string, string> {
  private seperator: string;
  private result: string;

  public collectPart(part: string[] | null): types.CollectorCollectPartResult<string> {
    if (!part) {
      // I am done...
      return { done: true, value: this.result };
    }

    const partLength = part.length;
    for (let i = 0; i < partLength; i++) {
      const subPart = part[i];
      // Add to result array and keep going
      if (this.result) {
        this.result += this.seperator + subPart;
      } else {
        this.result = subPart;
      }
    }

    return { done: false };
  }

  public getHints(): types.CollectorHints {
    return {
      needsValues: true,
      needsOrdering: true,
    };
  }

  constructor(seperator: string) {
    this.seperator = seperator;
    this.result = "";
  }
}
