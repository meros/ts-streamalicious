import * as types from "../types";

// This is a complicated piece of kit!
// Do all transforms in paralell, wait for all to complete and flatten the results
// (the transform is from T to U[] for the transform to be able to add/remove elements)
export default class AsyncTransformer<T, U>
  implements types.StatelessTransformer<T, U> {
  private waitingFor: { value: T; done: boolean }[] = [];

  private operation: types.AsyncTransformerOperation<T, U[]>;
  constructor(operation: types.AsyncTransformerOperation<T, U[]>) {
    this.operation = operation;
  }

  transformPart(part: T[], callback: types.Consumer<U[]>): void {
    if (!part) {
      callback(null);
    } else {
      var count = part.length;
      var result: U[][] = [];
      var flattenedResult: U[] = [];
      for (var i = 0, len = part.length; i < len; i++) {
        ((myIndex: number) => {
          this.operation(part[myIndex], (value: U[]) => {
            result[myIndex] = value;
            count--;
            if (count === 0) {
              // Flatten result
              for (var i = 0, len = result.length; i < len; i++) {
                for (var j = 0, lenj = result[i].length; j < lenj; j++) {
                  flattenedResult.push(result[i][j]);
                }
              }

              callback(flattenedResult);
            }
          });
        })(i);
      }
    }
  }
}
