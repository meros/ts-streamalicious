import ArrayStreamable from "./ArrayStreamable";

test("simple", (done) => {
  const arrayStreamable = new ArrayStreamable<number>([1, 2, 3, 4, 5, 6]);
  arrayStreamable.requestPart((result) => {
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    done();
  });
});

test("exhaust", (done) => {
  const arrayStreamable = new ArrayStreamable<number>([1, 2, 3, 4, 5, 6]);
  arrayStreamable.requestPart((result) => {
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    arrayStreamable.requestPart((result) => {
      expect(result).toEqual(null);
      done();
    });
  });
});

test("empty", (done) => {
  const arrayStreamable = new ArrayStreamable<number>(null);
  arrayStreamable.requestPart((result) => {
    expect(result).toEqual(null);
    done();
  });
});

describe("requestPartCount (pull-based optimization)", () => {
  test("returns count of elements", (done) => {
    const arrayStreamable = new ArrayStreamable<number>([1, 2, 3, 4, 5, 6]);
    arrayStreamable.requestPartCount((count) => {
      expect(count).toBe(6);
      done();
    });
  });

  test("exhaust returns null", (done) => {
    const arrayStreamable = new ArrayStreamable<number>([1, 2, 3, 4, 5, 6]);
    arrayStreamable.requestPartCount((count) => {
      expect(count).toBe(6);
      arrayStreamable.requestPartCount((count) => {
        expect(count).toEqual(null);
        done();
      });
    });
  });

  test("empty array returns 0", (done) => {
    const arrayStreamable = new ArrayStreamable<number>([]);
    arrayStreamable.requestPartCount((count) => {
      expect(count).toBe(0);
      done();
    });
  });

  test("null array returns null", (done) => {
    const arrayStreamable = new ArrayStreamable<number>(null);
    arrayStreamable.requestPartCount((count) => {
      expect(count).toEqual(null);
      done();
    });
  });
});
