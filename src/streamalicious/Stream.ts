import * as core from "./core";
import * as types from "./types";
import * as statelesstransforms from "./statelesstransforms";
import * as collectors from "./collectors";

export default class Stream<T> {
  private coreStream: core.CoreStream<T>;
  constructor(streamable: types.Streamable<T>) {
    this.coreStream = new core.CoreStream(streamable);
  }

  // Generic
  public transform<U>(
    transform: statelesstransforms.AsyncTransformerOperation<T, U>
  ) {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.asyncTransform(transform),
      Stream.create
    );
  }

  public transformSync<U>(
    transform: statelesstransforms.SyncTransformerOperation<T, U>
  ) {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.syncTransform(transform),
      Stream.create
    );
  }

  public flatMap<U>(
    transform: statelesstransforms.AsyncTransformerOperation<T, Stream<U>>
  ): Stream<U> {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.asyncFlatMap(transform),
      Stream.create
    );
  }

  public flatMapSync<U>(
    transform: statelesstransforms.SyncTransformerOperation<T, Stream<U>>
  ): Stream<U> {
    return this.coreStream.coreStatelessTransform(
      statelesstransforms.syncFlatMap(transform),
      Stream.create
    );
  }

  public collect<U>(
    collector: types.Collector<T, U>,
    callback: types.Consumer<U>
  ) {
    this.coreStream.coreCollect(collector, callback);
  }

  // Utility
  public toArray(callback: types.Consumer<T[]>) {
    this.collect(collectors.toArray<T>(), callback);
  }

  public count(callback: types.Consumer<number>) {
    this.collect(collectors.toCount(), callback);
  }

  private static create<U>(streamable: types.Streamable<U>): Stream<U> {
    return new Stream<U>(streamable);
  }
}
