import * as types from "../types";
import Stream from "../Stream";

import AsyncTransformer from "./AsyncTransformer";

/**
 * Creates an async transform (modern async/await API).
 * Supports both sync and async (Promise-returning) functions.
 */
export function promiseTransform<T, U>(
  transform: types.PromiseTransformerOperation<T, U>
): types.StatelessTransformer<T, U> {
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    Promise.resolve(transform(value)).then((result: U) => callback([result]))
  );
}

/**
 * Creates an async flatMap transform (modern async/await API).
 * Supports both sync and async (Promise-returning) functions.
 */
export function promiseFlatMap<T, U>(
  transform: types.PromiseTransformerOperation<T, Stream<U>>
): types.StatelessTransformer<T, U> {
  // This implementation has the same problem as Java flatmap, it unpacks the entire stream forcefully.
  // This has performance impacts on limited streams and hangs on unlimited streams.
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    Promise.resolve(transform(value)).then((stream: Stream<U>) => stream.toArrayCb(callback))
  );
}

/**
 * @deprecated Use promiseTransform for modern async/await API.
 * Creates a callback-based async transform (legacy API).
 */
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
  return new AsyncTransformer<T, U>((value, callback) => callback([transform(value)]));
}

/**
 * @deprecated Use promiseFlatMap for modern async/await API.
 * Creates a callback-based async flatMap transform (legacy API).
 */
export function asyncFlatMap<T, U>(
  transform: types.AsyncTransformerOperation<T, Stream<U>>
): types.StatelessTransformer<T, U> {
  // This implementation has the same problem as Java flatmap, it unpacks the entire stream forcefully.
  // This has performance impacts on limited streams and hangs on unlimited streams.
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    transform(value, (stream: Stream<U>) => stream.toArrayCb(callback))
  );
}

export function syncFlatMap<T, U>(
  transform: types.SyncTransformerOperation<T, Stream<U>>
): types.StatelessTransformer<T, U> {
  // This implementation has the same problem as Java flatmap, it unpacks the entire stream forcefully.
  // This has performance impacts on limited streams and hangs on unlimited streams.
  return new AsyncTransformer<T, U>((value: T, callback: types.Consumer<U[]>) =>
    transform(value).toArrayCb(callback)
  );
}
