export interface Consumer<T> {
  (value: T): void;
}

export interface Mapper<T, U> {
  (value: T): U;
}

export interface Streamable<T> {
  requestPart(callback: Consumer<T[]>): void;
}

export interface CollectorCollectPartResult<T> {
  done: boolean;
  value?: T;
}

export interface Collector<T, U> {
  collectPart(part: T[]): CollectorCollectPartResult<U>;
}

export interface StatelessTransformer<T, U> {
  transformPart(part: T[], callback: Consumer<U[]>): void;
}

export const dummy = {};
