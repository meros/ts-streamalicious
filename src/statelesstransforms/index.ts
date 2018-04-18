import * as types from "../types";
import Stream from "../Stream";

import AsyncTransformer from "./AsyncTransformer";

export function asyncTransform<T, U>(
  transform: types.AsyncTransformerOperation<T, U>
): types.StatelessTransformer<T, U> {
  // Create asynctransformer, but wrap the values in arrays!
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    transform(value, (unwrapped: U) => callback([unwrapped]))
  );
}

export function syncTransform<T, U>(
  transform: types.SyncTransformerOperation<T, U>
): types.StatelessTransformer<T, U> {
  return new AsyncTransformer<T, U>((value, callback) =>
    callback([transform(value)])
  );
}

export function asyncFlatMap<T, U>(
  transform: types.AsyncTransformerOperation<T, Stream<U>>
): types.StatelessTransformer<T, U> {
  // This implementation has the same problem as Java flatmap, it unpacks the entire stream forcefullly.
  // This has performance impacts on limited streams and hangs on unlimited streams. The cost of doing better is a little high right now though and this is good enough for most cases
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    transform(value, (stream: Stream<U>) => stream.toArray(callback))
  );
}

export function syncFlatMap<T, U>(
  transform: types.SyncTransformerOperation<T, Stream<U>>
): types.StatelessTransformer<T, U> {
  // This implementation has the same problem as Java flatmap, it unpacks the entire stream forcefullly.
  // This has performance impacts on limited streams and hangs on unlimited streams. The cost of doing better is a little high right now though and this is good enough for most cases
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    transform(value).toArray(callback)
  );
}
