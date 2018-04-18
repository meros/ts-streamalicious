import * as streams from ".";
import ArrayStreamable from "./ArrayStreamable";
import Stream from "../Stream";

test("ArrayStreamable", () => {
  const stream = streams.fromArray([]);
  expect(stream).toBeInstanceOf(Stream);
});
