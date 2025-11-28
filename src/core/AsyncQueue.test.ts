import AsyncQueue from "./AsyncQueue";

describe("AsyncQueue", () => {
  test("processes operations in order", (done) => {
    const results: number[] = [];
    const queue = new AsyncQueue<number>(3, () => {});

    queue.push(
      (cb) => setTimeout(() => cb(1), 50),
      (val) => results.push(val)
    );
    queue.push(
      (cb) => setTimeout(() => cb(2), 10),
      (val) => results.push(val)
    );
    queue.push(
      (cb) => setTimeout(() => cb(3), 30),
      (val) => {
        results.push(val);
        expect(results).toEqual([1, 2, 3]);
        done();
      }
    );
  });

  test("calls readyForMore callback when queue has capacity", () => {
    let readyForMoreCalled = 0;
    const queue = new AsyncQueue<number>(5, () => {
      readyForMoreCalled++;
    });

    queue.push(
      (cb) => cb(1),
      () => {}
    );
    // readyForMore is called in push when queue.length < maxLength
    // and again after updateQueue when queue is processed
    expect(readyForMoreCalled).toBeGreaterThan(0);
  });

  test("handles immediate completions", (done) => {
    const results: number[] = [];
    const queue = new AsyncQueue<number>(5, () => {});

    queue.push(
      (cb) => cb(1),
      (val) => results.push(val)
    );
    queue.push(
      (cb) => cb(2),
      (val) => results.push(val)
    );
    queue.push(
      (cb) => cb(3),
      (val) => {
        results.push(val);
        expect(results).toEqual([1, 2, 3]);
        done();
      }
    );
  });
});
