import * as core from "./core";
import * as types from "./types";
import * as statelesstransforms from "./statelesstransforms";
import * as collectors from "./collectors";

export default class Stream<T> {
  private coreStream: core.CoreStream<T>;
  constructor(streamable: types.Streamable<T>) {
    this.coreStream = new core.CoreStream(streamable);
  }

  // ==========================================
  // Modern async/await API (first-class)
  // ==========================================

  /**
   * Transform each element using a function that returns a value or Promise.
   * Modern async/await API - preferred over transformCb.
   * Accepts both sync and async functions for flexibility.
   * @param transform - Function to transform each element
   * @param options - Optional settings including maxConcurrency (default: 10)
   */
  public transform<U>(
    transform: types.PromiseTransformerOperation<T, U>,
    options?: types.TransformOptions
  ): Stream<U> {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.promiseTransform(transform, options?.maxConcurrency),
      Stream.create
    );
  }

  /**
   * FlatMap each element using a function that returns a Stream or Promise<Stream>.
   * Modern async/await API - preferred over flatMapCb.
   * Accepts both sync and async functions for flexibility.
   * @param transform - Function to transform each element into a Stream
   * @param options - Optional settings including maxConcurrency (default: 10)
   */
  public flatMap<U>(
    transform: types.PromiseTransformerOperation<T, Stream<U>>,
    options?: types.TransformOptions
  ): Stream<U> {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.promiseFlatMap(transform, options?.maxConcurrency),
      Stream.create
    );
  }

  /**
   * Collect the stream using a collector, returning a Promise.
   * Modern async/await API - preferred over collectCb.
   */
  public collect<U>(collector: types.Collector<T, U>): Promise<U> {
    return this.coreStream.coreCollectAsync(collector);
  }

  /**
   * Collect all elements into an array, returning a Promise.
   * Modern async/await API - preferred over toArrayCb.
   */
  public toArray(): Promise<T[]> {
    return this.collect(collectors.toArray<T>());
  }

  /**
   * Count the number of elements, returning a Promise.
   * Modern async/await API - preferred over countCb.
   */
  public count(): Promise<number> {
    return this.collect(collectors.toCount());
  }

  // ==========================================
  // Synchronous transforms (unchanged)
  // ==========================================

  /**
   * Transform each element synchronously.
   */
  public transformSync<U>(transform: types.SyncTransformerOperation<T, U>): Stream<U> {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.syncTransform(transform),
      Stream.create
    );
  }

  /**
   * FlatMap each element synchronously.
   */
  public flatMapSync<U>(transform: types.SyncTransformerOperation<T, Stream<U>>): Stream<U> {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.syncFlatMap(transform),
      Stream.create
    );
  }

  // ==========================================
  // Legacy callback-based API (deprecated)
  // ==========================================

  /**
   * @deprecated Use transform() with Promise-returning function instead.
   * Transform each element using a callback-based async function.
   */
  public transformCb<U>(transform: types.AsyncTransformerOperation<T, U>): Stream<U> {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.asyncTransform(transform),
      Stream.create
    );
  }

  /**
   * @deprecated Use flatMap() with Promise-returning function instead.
   * FlatMap each element using a callback-based async function.
   */
  public flatMapCb<U>(transform: types.AsyncTransformerOperation<T, Stream<U>>): Stream<U> {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.asyncFlatMap(transform),
      Stream.create
    );
  }

  /**
   * @deprecated Use collect() which returns a Promise instead.
   * Collect the stream using a collector with a callback.
   */
  public collectCb<U>(collector: types.Collector<T, U>, callback: types.Consumer<U>): void {
    this.coreStream.coreCollect(collector, callback);
  }

  /**
   * @deprecated Use toArray() which returns a Promise instead.
   * Collect all elements into an array with a callback.
   */
  public toArrayCb(callback: types.Consumer<T[]>): void {
    this.collectCb(collectors.toArray<T>(), callback);
  }

  /**
   * @deprecated Use count() which returns a Promise instead.
   * Count the number of elements with a callback.
   */
  public countCb(callback: types.Consumer<number>): void {
    this.collectCb(collectors.toCount(), callback);
  }

  private static create<U>(streamable: types.Streamable<U>): Stream<U> {
    return new Stream<U>(streamable);
  }
}
