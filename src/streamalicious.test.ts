import * as streamalicious from "./streamalicious";

// ==========================================
// Modern async/await API tests
// ==========================================

describe("Modern async/await API", () => {
  test("Array source and toArray returns Promise", async () => {
    const result = await streamalicious.streamables
      .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .toArray();
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test("Array source and count returns Promise", async () => {
    const count = await streamalicious.streamables
      .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .count();
    expect(count).toEqual(10);
  });

  test("Array source and Promise-based async transform", async () => {
    const result = await streamalicious.streamables
      .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .transform(async (val: number) => val * val)
      .toArray();
    expect(result).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
  });

  test("Array source and sync transform with async collection", async () => {
    const result = await streamalicious.streamables
      .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .transformSync((val) => val * val)
      .toArray();
    expect(result).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
  });

  test("Array of array source and Promise-based async flatmap", async () => {
    const result = await streamalicious.streamables
      .fromArray([[1, 2], [3], [4, 5, 6, 7], [], [8, 9, 10]])
      .flatMap<number>(async (value: number[]) => {
        return streamalicious.streamables.fromArray(value);
      })
      .toArray();
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test("Array of array source and sync flatmap with async collection", async () => {
    const result = await streamalicious.streamables
      .fromArray([[1, 2], [3], [4, 5, 6, 7], [], [8, 9, 10]])
      .flatMapSync<number>((value: number[]) => {
        return streamalicious.streamables.fromArray(value);
      })
      .toArray();
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test("Array source and string joining collector with async collect", async () => {
    const result = await streamalicious.streamables
      .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .transform(async (value: number) => value.toString())
      .collect(streamalicious.collectors.toJointString(", "));
    expect(result).toEqual("1, 2, 3, 4, 5, 6, 7, 8, 9, 10");
  });
});

// ==========================================
// Legacy callback-based API tests (deprecated but backwards compatible)
// ==========================================

describe("Legacy callback-based API (deprecated)", () => {
  test("Array source and collect with callback", (done) => {
    streamalicious.streamables
      .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .toArrayCb((result) => {
        expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        done();
      });
  });

  test("Array source and count with callback", (done) => {
    streamalicious.streamables.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).countCb((count) => {
      expect(count).toEqual(10);
      done();
    });
  });

  test("Array source and callback-based async transform", (done) => {
    streamalicious.streamables
      .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .transformCb((val: number, callback: streamalicious.types.Consumer<number>) =>
        callback(val * val)
      )
      .toArrayCb((array) => {
        expect(array).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
        done();
      });
  });

  test("Array source and simple transform - sync with callback collection", (done) => {
    streamalicious.streamables
      .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .transformSync((val) => {
        return val * val;
      })
      .toArrayCb((array) => {
        expect(array).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
        done();
      });
  });

  test("Array of array source and callback-based async flatmap", (done) => {
    streamalicious.streamables
      .fromArray([[1, 2], [3], [4, 5, 6, 7], [], [8, 9, 10]])
      .flatMapCb<number>(
        (value: number[], callback: streamalicious.types.Consumer<streamalicious.Stream<number>>) => {
          callback(streamalicious.streamables.fromArray(value));
        }
      )
      .toArrayCb((array) => {
        expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        done();
      });
  });

  test("Array of array source and sync flatmap with callback collection", (done) => {
    streamalicious.streamables
      .fromArray([[1, 2], [3], [4, 5, 6, 7], [], [8, 9, 10]])
      .flatMapSync<number>((value: number[]) => {
        return streamalicious.streamables.fromArray(value);
      })
      .toArrayCb((array) => {
        expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        done();
      });
  });

  test("Array source and string joining collector with callback", (done) => {
    streamalicious.streamables
      .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .transformCb((value: number, callback: streamalicious.types.Consumer<string>) => {
        callback(value.toString());
      })
      .collectCb(streamalicious.collectors.toJointString(", "), (jointString: string) => {
        expect(jointString).toEqual("1, 2, 3, 4, 5, 6, 7, 8, 9, 10");
        done();
      });
  });
});
