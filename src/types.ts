export interface Consumer<T> {
  (value: T): void;
}

export interface Mapper<T, U> {
  (value: T): U;
}

export interface Streamable<T> {
  requestPart(callback: Consumer<T[] | null>): void;

  /**
   * Optional method to request only the count of elements in a part.
   * Used for pull-based optimization when a collector doesn't need actual values.
   * If not implemented, falls back to requestPart and counts the results.
   */
  requestPartCount?(callback: Consumer<number | null>): void;
}

export interface CollectorCollectPartResult<T> {
  done: boolean;
  value?: T;
}

/**
 * Hints about what information a collector needs to compute its result.
 * Used to optimize stream processing by skipping unnecessary work.
 */
export interface CollectorHints {
  /**
   * Whether the collector needs the actual values of the elements.
   * If false, the stream may skip computing actual values and only track counts.
   * Default is true if not specified.
   */
  needsValues?: boolean;

  /**
   * Whether the collector needs elements in their original order.
   * If false, the stream may process elements out of order for better performance.
   * Default is true if not specified.
   */
  needsOrdering?: boolean;
}

export interface Collector<T, U> {
  collectPart(part: T[] | null): CollectorCollectPartResult<U>;

  /**
   * Optional method to collect only the count of elements without needing actual values.
   * Used for pull-based optimization when the collector has needsValues: false.
   * If not implemented, falls back to creating a placeholder array.
   */
  collectPartCount?(count: number | null): CollectorCollectPartResult<U>;

  /**
   * Optional method to provide hints about what information the collector needs.
   * Streams can use these hints to optimize processing (e.g., skip computing
   * values if only counting, process out of order if ordering doesn't matter).
   */
  getHints?(): CollectorHints;
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
