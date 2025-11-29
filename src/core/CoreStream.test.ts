import CoreStream from "./CoreStream";
import ArrayStreamable from "../streamables/ArrayStreamable";
import * as collectors from "../collectors";
import * as statelesstransforms from "../statelesstransforms";
import Stream from "../Stream";

describe("CoreStream", () => {
  // Modern async/await API tests
  describe("Modern async/await API", () => {
    test("coreCollectAsync with array collector returns Promise", async () => {
      const streamable = new ArrayStreamable([1, 2, 3, 4, 5]);
      const coreStream = new CoreStream(streamable);

      const result = await coreStream.coreCollectAsync(collectors.toArray<number>());
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test("coreCollectAsync with count collector returns Promise", async () => {
      const streamable = new ArrayStreamable([1, 2, 3, 4, 5]);
      const coreStream = new CoreStream(streamable);

      const count = await coreStream.coreCollectAsync(collectors.toCount<number>());
      expect(count).toBe(5);
    });
  });

  // Legacy callback-based API tests (deprecated but backwards compatible)
  describe("Legacy callback-based API", () => {
    test("coreCollect with array collector", (done) => {
      const streamable = new ArrayStreamable([1, 2, 3, 4, 5]);
      const coreStream = new CoreStream(streamable);

      coreStream.coreCollect(collectors.toArray<number>(), (result) => {
        expect(result).toEqual([1, 2, 3, 4, 5]);
        done();
      });
    });

    test("coreCollect with count collector", (done) => {
      const streamable = new ArrayStreamable([1, 2, 3, 4, 5]);
      const coreStream = new CoreStream(streamable);

      coreStream.coreCollect(collectors.toCount<number>(), (count) => {
        expect(count).toBe(5);
        done();
      });
    });
  });

  test("coreStatelessTransform creates new stream", () => {
    const streamable = new ArrayStreamable([1, 2, 3]);
    const coreStream = new CoreStream(streamable);

    const transformed = coreStream.coreStatelessTransform(
      statelesstransforms.syncTransform((n: number) => n * 2),
      (s) => new Stream(s)
    );

    expect(transformed).toBeInstanceOf(Stream);
  });
});
