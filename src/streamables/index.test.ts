import * as streams from ".";
import Stream from "../Stream";

test("ArrayStreamable", () => {
  const stream = streams.fromArray([]);
  expect(stream).toBeInstanceOf(Stream);
});
