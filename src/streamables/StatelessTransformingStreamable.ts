import * as types from "../types";

// This class is a streamable that has another
// streamable as source, but transforms all parts
// using a stateless transform
export default class StatelessTransformingStreamable<T, U> implements types.Streamable<U> {
  private transformer: types.StatelessTransformer<T, U>;
  private streamable: types.Streamable<T>;

  constructor(streamable: types.Streamable<T>, transformer: types.StatelessTransformer<T, U>) {
    this.transformer = transformer;
    this.streamable = streamable;
  }

  requestPart(callback: types.Consumer<U[] | null>) {
    this.streamable.requestPart((part: T[] | null) => {
      this.transformer.transformPart(part, callback);
    });
  }

  requestPartCount(callback: types.Consumer<number | null>) {
    // For a 1:1 transform, if upstream supports count-only mode, use it
    // Otherwise, fall back to requesting parts and counting them
    if (this.streamable.requestPartCount) {
      this.streamable.requestPartCount(callback);
    } else {
      // Fallback: request actual part and count it
      this.streamable.requestPart((part: T[] | null) => {
        if (part === null) {
          callback(null);
        } else {
          this.transformer.transformPart(part, (transformedPart: U[] | null) => {
            callback(transformedPart === null ? null : transformedPart.length);
          });
        }
      });
    }
  }
}
