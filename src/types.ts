export interface Consumer<T> {
  (value: T): void;
}

export interface Mapper<T, U> {
  (value: T): U;
}

export interface Streamable<T> {
  requestPart(callback: Consumer<T[] | null>): void;
}

export interface CollectorCollectPartResult<T> {
  done: boolean;
  value?: T;
}

export interface Collector<T, U> {
  collectPart(part: T[] | null): CollectorCollectPartResult<U>;
}

export interface StatelessTransformer<T, U> {
  transformPart(part: T[] | null, callback: Consumer<U[] | null>): void;
}

/**
 * @deprecated Use PromiseTransformerOperation for async/await transforms.
 * Callback-based async transformer operation (legacy API).
 */
export interface AsyncTransformerOperation<T, U> {
  (value: T, callback: Consumer<U>): void;
}

export interface SyncTransformerOperation<T, U> {
  (value: T): U;
}

/**
 * Modern async transformer operation.
 * Supports both sync and async (Promise-returning) functions.
 * Use this for async/await transforms.
 */
export interface PromiseTransformerOperation<T, U> {
  (value: T): U | Promise<U>;
}

/**
 * Options for transform operations.
 */
export interface TransformOptions {
  /**
   * Maximum number of concurrent operations.
   * Limits how many async operations can run in parallel.
   * Default is 10.
   */
  maxConcurrency?: number;
}
