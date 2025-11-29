import * as types from "../types";

// Default maximum concurrent operations to prevent resource exhaustion
const DEFAULT_MAX_CONCURRENCY = 10;

// This is a complicated piece of kit!
// Do transforms in parallel with bounded concurrency, wait for all to complete and flatten the results
// (the transform is from T to U[] for the transform to be able to add/remove elements)
export default class AsyncTransformer<T, U> implements types.StatelessTransformer<T, U> {
  private operation: types.AsyncTransformerOperation<T, U[]>;
  private maxConcurrency: number;

  constructor(operation: types.AsyncTransformerOperation<T, U[]>, maxConcurrency?: number) {
    this.operation = operation;
    this.maxConcurrency = maxConcurrency ?? DEFAULT_MAX_CONCURRENCY;
  }

  transformPart(part: T[] | null, callback: types.Consumer<U[] | null>): void {
    // Null part, just pass through
    if (!part) {
      callback(null);
      return;
    }

    // Process items with bounded concurrency
    this.processWithBoundedConcurrency(part).then((result: U[][]) => {
      // Flatten result
      callback(([] as U[]).concat(...result));
    });
  }

  private processWithBoundedConcurrency(items: T[]): Promise<U[][]> {
    return new Promise<U[][]>((resolveAll) => {
      // Handle empty array case immediately
      if (items.length === 0) {
        resolveAll([]);
        return;
      }

      const results: U[][] = new Array(items.length);
      let currentIndex = 0;
      let activeCount = 0;

      const processNext = () => {
        while (activeCount < this.maxConcurrency && currentIndex < items.length) {
          const index = currentIndex++;
          activeCount++;

          this.operation(items[index], (result: U[]) => {
            results[index] = result;
            activeCount--;

            if (currentIndex >= items.length && activeCount === 0) {
              resolveAll(results);
            } else {
              processNext();
            }
          });
        }
      };

      processNext();
    });
  }
}
