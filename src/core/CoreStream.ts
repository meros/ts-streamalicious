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
      new streamables.StatelessTransformingStreamable<T, U>(
        this.streamable,
        transformer
      )
    );
  }

  public coreCollect<U>(
    collector: types.Collector<T, U>,
    callback: types.Consumer<U>
  ) {
    var done: boolean = false;
    var queue = new AsyncQueue<T[]>(50, () => {
      if (!done) {
        collectOne();
      }
    });
    var collectOne = () => {
      queue.push(
        // Operation to do
        (callback: types.Consumer<T[]>) => {
          this.streamable.requestPart(callback);
        },
        // A value is delivered (these are called in order)
        (part: T[]) => {
          if (!done) {
            var result = collector.collectPart(part);
            done = result.done || !part;
            if (done) {
              // Since we are done, lets call the initiator of the collection operation
              callback(result.value);
            }
          }
        }
      );
    };

    // Boot strap collecting
    collectOne();
  }
}
