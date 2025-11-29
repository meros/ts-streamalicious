import * as types from "../types";
import AsyncQueue from "./AsyncQueue";
import * as streamables from "../streamables";

export default class CoreStream<T> {
  private streamable: types.Streamable<T>;

  constructor(streamable: types.Streamable<T>) {
    this.streamable = streamable;
  }

  public coreStatelessTransform<U, V>(
    transformer: types.StatelessTransformer<T, U>,
    constructor: types.Mapper<types.Streamable<U>, V>
  ): V {
    return constructor(
      new streamables.StatelessTransformingStreamable<T, U>(this.streamable, transformer)
    );
  }

  /**
   * Promise-based collect operation (modern async/await API).
   */
  public coreCollectAsync<U>(collector: types.Collector<T, U>): Promise<U> {
    return new Promise<U>((resolve) => {
      this.coreCollect(collector, resolve);
    });
  }

  /**
   * @deprecated Use coreCollectAsync for modern async/await API.
   * Callback-based collect operation (legacy API).
   */
  public coreCollect<U>(collector: types.Collector<T, U>, callback: types.Consumer<U>) {
    // Check if collector has hints and if it doesn't need values
    const hints = collector.getHints?.();
    const needsValues = hints?.needsValues !== false;

    if (!needsValues && this.streamable.requestPartCount) {
      // Use optimized count-only collection path
      this.coreCollectCountOnly(collector, callback);
    } else {
      // Use standard collection path
      this.coreCollectStandard(collector, callback);
    }
  }

  /**
   * Optimized collection path for collectors that don't need actual values.
   * Uses requestPartCount to avoid computing/transferring actual values.
   */
  private coreCollectCountOnly<U>(collector: types.Collector<T, U>, callback: types.Consumer<U>) {
    let done: boolean = false;
    const queue = new AsyncQueue<number | null>(50, () => {
      if (!done) {
        collectOne();
      }
    });
    const collectOne = () => {
      queue.push(
        // Operation to do
        (cb: types.Consumer<number | null>) => {
          this.streamable.requestPartCount!(cb);
        },
        // A count is delivered (these are called in order)
        (count: number | null) => {
          if (!done) {
            // Use collectPartCount if available, otherwise fall back to placeholder array
            const result = collector.collectPartCount
              ? collector.collectPartCount(count)
              : collector.collectPart(count === null ? null : (new Array(count) as T[]));
            done = result.done || count === null;
            if (done && result.value !== undefined) {
              // Since we are done, lets call the initiator of the collection operation
              callback(result.value);
            }
          }
        }
      );
    };

    // Bootstrap collecting
    collectOne();
  }

  /**
   * Standard collection path that requests actual values.
   */
  private coreCollectStandard<U>(collector: types.Collector<T, U>, callback: types.Consumer<U>) {
    let done: boolean = false;
    const queue = new AsyncQueue<T[] | null>(50, () => {
      if (!done) {
        collectOne();
      }
    });
    const collectOne = () => {
      queue.push(
        // Operation to do
        (cb: types.Consumer<T[] | null>) => {
          this.streamable.requestPart(cb);
        },
        // A value is delivered (these are called in order)
        (part: T[] | null) => {
          if (!done) {
            const result = collector.collectPart(part);
            done = result.done || !part;
            if (done && result.value !== undefined) {
              // Since we are done, lets call the initiator of the collection operation
              callback(result.value);
            }
          }
        }
      );
    };

    // Bootstrap collecting
    collectOne();
  }
}
