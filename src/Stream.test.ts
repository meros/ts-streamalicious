import * as streamables from "./streamables";
import * as collectors from "./collectors";

describe("Stream class", () => {
  // ==========================================
  // Modern async/await API tests (first-class)
  // ==========================================

  describe("Modern async/await API", () => {
    test("transform with Promise-returning function", async () => {
      const result = await streamables
        .fromArray([1, 2, 3])
        .transform<number>(async (val) => {
          return new Promise((resolve) => setTimeout(() => resolve(val + 10), 10));
        })
        .toArray();

      expect(result).toEqual([11, 12, 13]);
    });

    test("transform with immediate Promise resolution", async () => {
      const result = await streamables
        .fromArray([1, 2, 3])
        .transform<number>(async (val) => val * 2)
        .toArray();

      expect(result).toEqual([2, 4, 6]);
    });

    test("chained async transforms", async () => {
      const result = await streamables
        .fromArray([1, 2, 3])
        .transform<number>(async (val) => val * 2)
        .transform<string>(async (val) => `value-${val}`)
        .toArray();

      expect(result).toEqual(["value-2", "value-4", "value-6"]);
    });

    test("flatMap with Promise-returning function", async () => {
      const result = await streamables
        .fromArray([1, 2, 3])
        .flatMap<number>(async (val) => streamables.fromArray([val, val * 10]))
        .toArray();

      expect(result).toEqual([1, 10, 2, 20, 3, 30]);
    });

    test("collect with custom collector returns Promise", async () => {
      const count = await streamables
        .fromArray([1, 2, 3, 4, 5])
        .collect(collectors.toCount<number>());

      expect(count).toBe(5);
    });

    test("toArray returns Promise", async () => {
      const result = await streamables.fromArray([1, 2, 3]).toArray();

      expect(result).toEqual([1, 2, 3]);
    });

    test("count returns Promise", async () => {
      const count = await streamables.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).count();

      expect(count).toBe(10);
    });

    test("empty stream with async API", async () => {
      const result = await streamables
        .fromArray<number>([])
        .transform<number>(async (x) => x * 2)
        .toArray();

      expect(result).toEqual([]);
    });

    test("count returns 0 for empty stream with async API", async () => {
      const count = await streamables.fromArray<number>([]).count();

      expect(count).toBe(0);
    });

    test("chained transforms and collect with async API", async () => {
      const result = await streamables
        .fromArray([1, 2, 3, 4, 5])
        .transformSync((x) => x * 2)
        .transformSync((x) => x.toString())
        .collect(collectors.toJointString("-"));

      expect(result).toBe("2-4-6-8-10");
    });

    test("joining empty stream with async API", async () => {
      const result = await streamables
        .fromArray<string>([])
        .collect(collectors.toJointString(","));

      expect(result).toBe("");
    });

    test("mixed sync and async transforms", async () => {
      const result = await streamables
        .fromArray([1, 2, 3])
        .transformSync((x) => x * 2)
        .transform<number>(async (x) => x + 1)
        .transformSync((x) => x.toString())
        .toArray();

      expect(result).toEqual(["3", "5", "7"]);
    });

    test("async transform with error handling", async () => {
      const result = await streamables
        .fromArray([1, 2, 3])
        .transform<number | string>(async (val) => {
          if (val === 2) {
            return "skipped";
          }
          return val * 10;
        })
        .toArray();

      expect(result).toEqual([10, "skipped", 30]);
    });

    test("async flatMap with delayed stream creation", async () => {
      const result = await streamables
        .fromArray([1, 2])
        .flatMap<number>(async (val) => {
          return new Promise((resolve) =>
            setTimeout(() => resolve(streamables.fromArray([val, val + 100])), 10)
          );
        })
        .toArray();

      expect(result).toEqual([1, 101, 2, 102]);
    });
  });

  // ==========================================
  // Synchronous transforms tests (unchanged)
  // ==========================================

  describe("Synchronous transforms", () => {
    test("transformSync chains correctly", async () => {
      const result = await streamables
        .fromArray([1, 2, 3])
        .transformSync((x) => x * 2)
        .transformSync((x) => x + 1)
        .toArray();

      expect(result).toEqual([3, 5, 7]);
    });

    test("flatMapSync", async () => {
      const result = await streamables
        .fromArray([1, 2, 3])
        .flatMapSync<number>((val) => streamables.fromArray([val, val * 10]))
        .toArray();

      expect(result).toEqual([1, 10, 2, 20, 3, 30]);
    });
  });

  // ==========================================
  // Legacy callback-based API tests (deprecated but backwards compatible)
  // ==========================================

  describe("Legacy callback-based API (deprecated)", () => {
    test("transformCb with async operation", (done) => {
      const stream = streamables.fromArray([1, 2, 3]);
      stream
        .transformCb<number>((val, cb) => {
          setTimeout(() => cb(val + 10), 10);
        })
        .toArrayCb((result) => {
          expect(result).toEqual([11, 12, 13]);
          done();
        });
    });

    test("transformSync chains correctly with callback collection", (done) => {
      streamables
        .fromArray([1, 2, 3])
        .transformSync((x) => x * 2)
        .transformSync((x) => x + 1)
        .toArrayCb((result) => {
          expect(result).toEqual([3, 5, 7]);
          done();
        });
    });

    test("flatMapCb with async operation", (done) => {
      streamables
        .fromArray([1, 2, 3])
        .flatMapCb<number>((val, cb) => {
          cb(streamables.fromArray([val, val * 10]));
        })
        .toArrayCb((result) => {
          expect(result).toEqual([1, 10, 2, 20, 3, 30]);
          done();
        });
    });

    test("flatMapSync with callback collection", (done) => {
      streamables
        .fromArray([1, 2, 3])
        .flatMapSync<number>((val) => streamables.fromArray([val, val * 10]))
        .toArrayCb((result) => {
          expect(result).toEqual([1, 10, 2, 20, 3, 30]);
          done();
        });
    });

    test("collectCb with custom collector", (done) => {
      streamables.fromArray([1, 2, 3, 4, 5]).collectCb(collectors.toCount<number>(), (count) => {
        expect(count).toBe(5);
        done();
      });
    });

    test("countCb utility method", (done) => {
      streamables.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).countCb((count) => {
        expect(count).toBe(10);
        done();
      });
    });

    test("empty stream operations with callback", (done) => {
      streamables
        .fromArray<number>([])
        .transformSync((x) => x * 2)
        .toArrayCb((result) => {
          expect(result).toEqual([]);
          done();
        });
    });

    test("chained transforms and collectCb", (done) => {
      streamables
        .fromArray([1, 2, 3, 4, 5])
        .transformSync((x) => x * 2)
        .transformSync((x) => x.toString())
        .collectCb(collectors.toJointString("-"), (result) => {
          expect(result).toBe("2-4-6-8-10");
          done();
        });
    });

    test("countCb returns 0 for empty stream", (done) => {
      streamables.fromArray<number>([]).countCb((count) => {
        expect(count).toBe(0);
        done();
      });
    });

    test("joining empty stream with callback", (done) => {
      streamables.fromArray<string>([]).collectCb(collectors.toJointString(","), (result) => {
        expect(result).toBe("");
        done();
      });
    });
  });
});
