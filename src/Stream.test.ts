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

    test("transform with sync function (no async keyword)", async () => {
      // transform() now accepts both sync and async functions
      const result = await streamables
        .fromArray([1, 2, 3])
        .transform((val) => val * 2)
        .toArray();

      expect(result).toEqual([2, 4, 6]);
    });

    test("flatMap with sync function (no async keyword)", async () => {
      // flatMap() now accepts both sync and async functions
      const result = await streamables
        .fromArray([1, 2, 3])
        .flatMap((val) => streamables.fromArray([val, val * 10]))
        .toArray();

      expect(result).toEqual([1, 10, 2, 20, 3, 30]);
    });

    test("mixed transform with sync and async inline", async () => {
      // Demonstrates that transform() can be used with sync functions
      // making it easy to switch between sync and async as needed
      const result = await streamables
        .fromArray([1, 2, 3])
        .transform((x) => x * 2) // sync
        .transform(async (x) => x + 1) // async
        .transform((x) => x.toString()) // sync
        .toArray();

      expect(result).toEqual(["3", "5", "7"]);
    });
  });

  // ==========================================
  // Parallel processing tests
  // ==========================================

  describe("Parallel processing", () => {
    test("processes many items in parallel", async () => {
      // Track concurrent execution count
      let currentConcurrent = 0;
      let maxConcurrent = 0;

      const result = await streamables
        .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .transform<number>(async (val) => {
          currentConcurrent++;
          maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
          // Simulate async work
          await new Promise((resolve) => setTimeout(resolve, 20));
          currentConcurrent--;
          return val * 2;
        })
        .toArray();

      expect(result).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
      // Should process multiple items concurrently
      expect(maxConcurrent).toBeGreaterThan(1);
    });

    test("handles 100 concurrent fetch-like operations efficiently", async () => {
      const itemCount = 100;
      const items = Array.from({ length: itemCount }, (_, i) => i + 1);

      // Track execution timing
      let currentConcurrent = 0;
      let maxConcurrent = 0;
      const startTime = Date.now();

      const result = await streamables
        .fromArray(items)
        .transform<number>(async (val) => {
          currentConcurrent++;
          maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
          // Simulate a network request (10ms delay)
          await new Promise((resolve) => setTimeout(resolve, 10));
          currentConcurrent--;
          return val * 2;
        })
        .toArray();

      const elapsedTime = Date.now() - startTime;

      // Verify correct results
      expect(result).toHaveLength(itemCount);
      expect(result[0]).toBe(2);
      expect(result[itemCount - 1]).toBe(itemCount * 2);

      // If sequential, would take at least 100 * 10ms = 1000ms
      // Parallel execution should be much faster
      expect(elapsedTime).toBeLessThan(500);

      // Should have significant concurrency
      expect(maxConcurrent).toBeGreaterThan(10);
    });

    test("maintains result order despite varying async completion times", async () => {
      const result = await streamables
        .fromArray([1, 2, 3, 4, 5])
        .transform<number>(async (val) => {
          // Items with higher values complete faster (reverse order)
          await new Promise((resolve) => setTimeout(resolve, (6 - val) * 10));
          return val;
        })
        .toArray();

      // Results should be in original order, not completion order
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test("parallel flatMap operations", async () => {
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      const result = await streamables
        .fromArray([1, 2, 3, 4, 5])
        .flatMap<number>(async (val) => {
          currentConcurrent++;
          maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
          await new Promise((resolve) => setTimeout(resolve, 20));
          currentConcurrent--;
          return streamables.fromArray([val, val * 10]);
        })
        .toArray();

      expect(result).toEqual([1, 10, 2, 20, 3, 30, 4, 40, 5, 50]);
      expect(maxConcurrent).toBeGreaterThan(1);
    });

    test("chained parallel transforms maintain efficiency", async () => {
      const items = Array.from({ length: 50 }, (_, i) => i + 1);
      const startTime = Date.now();

      const result = await streamables
        .fromArray(items)
        .transform<number>(async (val) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return val * 2;
        })
        .transform<string>(async (val) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return `item-${val}`;
        })
        .toArray();

      const elapsedTime = Date.now() - startTime;

      expect(result).toHaveLength(50);
      expect(result[0]).toBe("item-2");

      // Even with chained transforms, parallel processing keeps it fast
      // Sequential would be: 50 * 10ms * 2 transforms = 1000ms
      expect(elapsedTime).toBeLessThan(500);
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
