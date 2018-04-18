import * as types from "../types";

export default class JoiningCollector
  implements types.Collector<string, string> {
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
