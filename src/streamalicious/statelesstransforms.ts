import * as types from "./types";
import Stream from "./Stream";

export interface AsyncTransformerOperation<T, U> {
  (value: T, callback: types.Consumer<U>): void;
}

export interface SyncTransformerOperation<T, U> {
  (value: T): U;
}

// This is a complicated piece of kit!
// Do all transforms in paralell, wait for all to complete and flatten the results
// (the transform is from T to U[] for the transform to be able to add/remove elements)
class AsyncTransformer<T, U> implements types.StatelessTransformer<T, U> {
  private waitingFor: { value: T; done: boolean }[] = [];

  private operation: AsyncTransformerOperation<T, U[]>;
  constructor(operation: AsyncTransformerOperation<T, U[]>) {
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

export function asyncTransform<T, U>(
  transform: AsyncTransformerOperation<T, U>
): types.StatelessTransformer<T, U> {
  // Create asynctransformer, but wrap the values in arrays!
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    transform(value, (unwrapped: U) => callback([unwrapped]))
  );
}

export function syncTransform<T, U>(
  transform: SyncTransformerOperation<T, U>
): types.StatelessTransformer<T, U> {
  return new AsyncTransformer<T, U>((value, callback) =>
    callback([transform(value)])
  );
}

export function asyncFlatMap<T, U>(
  transform: AsyncTransformerOperation<T, Stream<U>>
): types.StatelessTransformer<T, U> {
  // This implementation has the same problem as Java flatmap, it unpacks the entire stream forcefullly.
  // This has performance impacts on limited streams and hangs on unlimited streams. The cost of doing better is a little high right now though and this is good enough for most cases
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    transform(value, (stream: Stream<U>) => stream.toArray(callback))
  );
}

export function syncFlatMap<T, U>(
  transform: SyncTransformerOperation<T, Stream<U>>
): types.StatelessTransformer<T, U> {
  // This implementation has the same problem as Java flatmap, it unpacks the entire stream forcefullly.
  // This has performance impacts on limited streams and hangs on unlimited streams. The cost of doing better is a little high right now though and this is good enough for most cases
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    transform(value).toArray(callback)
  );
}
