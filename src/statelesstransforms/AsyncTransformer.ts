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
    // Null part, just pass through
    if (!part) {
      callback(null);
      return;
    }

    // Map items of part to promises
    Promise.all<U[]>(
      part.map(
        (item: T) =>
          new Promise(resolve => {
            this.operation(item, (transformedItem: U[]) => {
              resolve(transformedItem);
            });
          })
      )
    ).then((result: U[][]) => {
      // Flatten result
      callback([].concat(...result));
    });
  }
}
