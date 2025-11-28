import AsyncTransformer from "./AsyncTransformer";

describe("AsyncTransformer", () => {
  test("transforms array elements asynchronously", (done) => {
    const transformer = new AsyncTransformer<number, number>((val, cb) => {
      setTimeout(() => cb([val * 2]), 10);
    });

    transformer.transformPart([1, 2, 3], (result) => {
      expect(result).toEqual([2, 4, 6]);
      done();
    });
  });

  test("passes null through unchanged", (done) => {
    const transformer = new AsyncTransformer<number, number>((val, cb) => {
      cb([val * 2]);
    });

    transformer.transformPart(null, (result) => {
      expect(result).toBeNull();
      done();
    });
  });

  test("flattens results correctly", (done) => {
    const transformer = new AsyncTransformer<number, number>((val, cb) => {
      cb([val, val * 10]);
    });

    transformer.transformPart([1, 2], (result) => {
      expect(result).toEqual([1, 10, 2, 20]);
      done();
    });
  });

  test("handles empty input array", (done) => {
    const transformer = new AsyncTransformer<number, number>((val, cb) => {
      cb([val * 2]);
    });

    transformer.transformPart([], (result) => {
      expect(result).toEqual([]);
      done();
    });
  });
});
