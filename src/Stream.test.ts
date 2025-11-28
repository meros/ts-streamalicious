import * as streamables from "./streamables";
import * as collectors from "./collectors";

describe("Stream class", () => {
  test("transform with async operation", (done) => {
    const stream = streamables.fromArray([1, 2, 3]);
    stream
      .transform<number>((val, cb) => {
        setTimeout(() => cb(val + 10), 10);
      })
      .toArray((result) => {
        expect(result).toEqual([11, 12, 13]);
        done();
      });
  });

  test("transformSync chains correctly", (done) => {
    streamables
      .fromArray([1, 2, 3])
      .transformSync((x) => x * 2)
      .transformSync((x) => x + 1)
      .toArray((result) => {
        expect(result).toEqual([3, 5, 7]);
        done();
      });
  });

  test("flatMap with async operation", (done) => {
    streamables
      .fromArray([1, 2, 3])
      .flatMap<number>((val, cb) => {
        cb(streamables.fromArray([val, val * 10]));
      })
      .toArray((result) => {
        expect(result).toEqual([1, 10, 2, 20, 3, 30]);
        done();
      });
  });

  test("flatMapSync", (done) => {
    streamables
      .fromArray([1, 2, 3])
      .flatMapSync<number>((val) => streamables.fromArray([val, val * 10]))
      .toArray((result) => {
        expect(result).toEqual([1, 10, 2, 20, 3, 30]);
        done();
      });
  });

  test("collect with custom collector", (done) => {
    streamables.fromArray([1, 2, 3, 4, 5]).collect(collectors.toCount<number>(), (count) => {
      expect(count).toBe(5);
      done();
    });
  });

  test("count utility method", (done) => {
    streamables.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).count((count) => {
      expect(count).toBe(10);
      done();
    });
  });

  test("empty stream operations", (done) => {
    streamables
      .fromArray<number>([])
      .transformSync((x) => x * 2)
      .toArray((result) => {
        expect(result).toEqual([]);
        done();
      });
  });

  test("chained transforms and collect", (done) => {
    streamables
      .fromArray([1, 2, 3, 4, 5])
      .transformSync((x) => x * 2)
      .transformSync((x) => x.toString())
      .collect(collectors.toJointString("-"), (result) => {
        expect(result).toBe("2-4-6-8-10");
        done();
      });
  });
});
