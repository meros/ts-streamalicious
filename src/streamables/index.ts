import Stream from "../Stream";

import ArrayStreamable from "./ArrayStreamable";

export function fromArray<T>(array: T[]): Stream<T> {
  return new Stream<T>(new ArrayStreamable(array));
}

export { default as StatelessTransformingStreamable } from "./StatelessTransformingStreamable";
