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
      const result = await streamables.fromArray<string>([]).collect(collectors.toJointString(","));

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

    test("handles 100 items with bounded concurrency (default max 10)", async () => {
      const itemCount = 100;
      const items = Array.from({ length: itemCount }, (_, i) => i + 1);

      // Track execution timing and concurrency
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
      // With bounded parallelism (default 10), should be ~100ms (100 items / 10 concurrent * 10ms)
      expect(elapsedTime).toBeLessThan(500);

      // Should respect max concurrency limit (default is 10)
      expect(maxConcurrent).toBeLessThanOrEqual(10);
      expect(maxConcurrent).toBeGreaterThan(1);
    });

    test("respects custom maxConcurrency option", async () => {
      const itemCount = 50;
      const items = Array.from({ length: itemCount }, (_, i) => i + 1);
      const customMaxConcurrency = 5;

      let currentConcurrent = 0;
      let maxConcurrent = 0;

      const result = await streamables
        .fromArray(items)
        .transform<number>(
          async (val) => {
            currentConcurrent++;
            maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
            await new Promise((resolve) => setTimeout(resolve, 20));
            currentConcurrent--;
            return val * 2;
          },
          { maxConcurrency: customMaxConcurrency }
        )
        .toArray();

      expect(result).toHaveLength(itemCount);
      expect(result[0]).toBe(2);

      // Should respect the custom max concurrency limit
      expect(maxConcurrent).toBeLessThanOrEqual(customMaxConcurrency);
      expect(maxConcurrent).toBeGreaterThan(1);
    });

    test("higher maxConcurrency allows more parallel operations", async () => {
      const itemCount = 30;
      const items = Array.from({ length: itemCount }, (_, i) => i + 1);
      const highConcurrency = 30;

      let currentConcurrent = 0;
      let maxConcurrent = 0;

      const result = await streamables
        .fromArray(items)
        .transform<number>(
          async (val) => {
            currentConcurrent++;
            maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
            await new Promise((resolve) => setTimeout(resolve, 20));
            currentConcurrent--;
            return val * 2;
          },
          { maxConcurrency: highConcurrency }
        )
        .toArray();

      expect(result).toHaveLength(itemCount);

      // With high concurrency limit, all items can run in parallel
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

    test("flatMap respects maxConcurrency option", async () => {
      const customMaxConcurrency = 3;
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      const result = await streamables
        .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .flatMap<number>(
          async (val) => {
            currentConcurrent++;
            maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
            await new Promise((resolve) => setTimeout(resolve, 20));
            currentConcurrent--;
            return streamables.fromArray([val, val * 10]);
          },
          { maxConcurrency: customMaxConcurrency }
        )
        .toArray();

      expect(result).toEqual([
        1, 10, 2, 20, 3, 30, 4, 40, 5, 50, 6, 60, 7, 70, 8, 80, 9, 90, 10, 100,
      ]);
      expect(maxConcurrent).toBeLessThanOrEqual(customMaxConcurrency);
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

    test("bounded concurrency prevents resource exhaustion", async () => {
      // Simulate 100 "network requests" that would overwhelm resources if all ran at once
      const itemCount = 100;
      const items = Array.from({ length: itemCount }, (_, i) => i + 1);
      const maxAllowedConcurrency = 10;

      let currentConcurrent = 0;
      let maxConcurrent = 0;
      let overLimitCount = 0;

      const result = await streamables
        .fromArray(items)
        .transform<number>(
          async (val) => {
            currentConcurrent++;
            if (currentConcurrent > maxAllowedConcurrency) {
              overLimitCount++;
            }
            maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
            await new Promise((resolve) => setTimeout(resolve, 10));
            currentConcurrent--;
            return val;
          },
          { maxConcurrency: maxAllowedConcurrency }
        )
        .toArray();

      expect(result).toHaveLength(itemCount);
      // Should never exceed the limit
      expect(overLimitCount).toBe(0);
      expect(maxConcurrent).toBeLessThanOrEqual(maxAllowedConcurrency);
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

  // ==========================================
  // Pull-based optimization tests
  // ==========================================

  describe("Pull-based optimization", () => {
    test("count() skips expensive transforms when collector doesn't need values", async () => {
      let transformCallCount = 0;

      // This test verifies that when using count(), expensive transforms are skipped
      // because CountCollector has needsValues: false
      const count = await streamables
        .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .transformSync((x) => {
          transformCallCount++;
          return x * 2;
        })
        .count();

      expect(count).toBe(10);
      // The transform should NOT be called because count() uses optimized path
      expect(transformCallCount).toBe(0);
    });

    test("toArray() still executes transforms when collector needs values", async () => {
      let transformCallCount = 0;

      const result = await streamables
        .fromArray([1, 2, 3, 4, 5])
        .transformSync((x) => {
          transformCallCount++;
          return x * 2;
        })
        .toArray();

      expect(result).toEqual([2, 4, 6, 8, 10]);
      // The transform should be called because toArray() needs actual values
      expect(transformCallCount).toBe(5);
    });

    test("count with async transforms also skips expensive operations", async () => {
      let transformCallCount = 0;

      const count = await streamables
        .fromArray([1, 2, 3, 4, 5])
        .transform<number>(async (x) => {
          transformCallCount++;
          return x * 2;
        })
        .count();

      expect(count).toBe(5);
      // The transform should NOT be called because count() uses optimized path
      expect(transformCallCount).toBe(0);
    });

    test("collector hints are respected for different collectors", async () => {
      // CountCollector: needsValues: false
      expect(collectors.toCount<number>().getHints?.()).toEqual({
        needsValues: false,
        needsOrdering: false,
      });

      // ArrayCollector: needsValues: true
      expect(collectors.toArray<number>().getHints?.()).toEqual({
        needsValues: true,
        needsOrdering: true,
      });

      // JoiningCollector: needsValues: true
      expect(collectors.toJointString(",").getHints?.()).toEqual({
        needsValues: true,
        needsOrdering: true,
      });
    });

    test("chained transforms are all skipped when counting", async () => {
      let transform1CallCount = 0;
      let transform2CallCount = 0;

      const count = await streamables
        .fromArray([1, 2, 3])
        .transformSync((x) => {
          transform1CallCount++;
          return x * 2;
        })
        .transformSync((x) => {
          transform2CallCount++;
          return x.toString();
        })
        .count();

      expect(count).toBe(3);
      // Neither transform should be called
      expect(transform1CallCount).toBe(0);
      expect(transform2CallCount).toBe(0);
    });

    test("count on empty stream with optimization", async () => {
      let transformCallCount = 0;

      const count = await streamables
        .fromArray<number>([])
        .transformSync((x) => {
          transformCallCount++;
          return x * 2;
        })
        .count();

      expect(count).toBe(0);
      expect(transformCallCount).toBe(0);
    });
  });
});
