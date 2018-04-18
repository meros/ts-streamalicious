import * as types from "../types";

// This class is a streamable that has another
// streamable as source, but transforms all parts
// using a stateless transform
export default class StatelessTransformingStreamable<T, U>
  implements types.Streamable<U> {
  private transformer: types.StatelessTransformer<T, U>;
  private streamable: types.Streamable<T>;

  constructor(
    streamable: types.Streamable<T>,
    transformer: types.StatelessTransformer<T, U>
  ) {
    this.transformer = transformer;
    this.streamable = streamable;
  }

  requestPart(callback: types.Consumer<U[]>) {
    this.streamable.requestPart((part: T[]) => {
      this.transformer.transformPart(part, callback);
    });
  }
}
