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
 * Modern Promise-based async transformer operation.
 * Use this for async/await transforms.
 */
export interface PromiseTransformerOperation<T, U> {
  (value: T): Promise<U>;
}
