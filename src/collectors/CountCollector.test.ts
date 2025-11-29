import CountCollector from "./CountCollector";

test("simple", () => {
  const countCollector = new CountCollector<number>();
  expect(countCollector.collectPart([1, 2, 3])).toEqual({ done: false });
  expect(countCollector.collectPart([4, 5, 6])).toEqual({ done: false });
  expect(countCollector.collectPart(null)).toEqual({
    done: true,
    value: 6,
  });
});

test("empty", () => {
  const countCollector = new CountCollector<number>();
  expect(countCollector.collectPart(null)).toEqual({
    done: true,
    value: 0,
  });
});

test("emptyparts", () => {
  const countCollector = new CountCollector<number>();
  expect(countCollector.collectPart([])).toEqual({ done: false });
  expect(countCollector.collectPart(null)).toEqual({
    done: true,
    value: 0,
  });
});

test("getHints returns needsValues: false and needsOrdering: false", () => {
  const countCollector = new CountCollector<number>();
  const hints = countCollector.getHints();
  expect(hints.needsValues).toBe(false);
  expect(hints.needsOrdering).toBe(false);
});

describe("collectPartCount (pull-based optimization)", () => {
  test("collects counts directly without values", () => {
    const countCollector = new CountCollector<number>();
    expect(countCollector.collectPartCount(3)).toEqual({ done: false });
    expect(countCollector.collectPartCount(3)).toEqual({ done: false });
    expect(countCollector.collectPartCount(null)).toEqual({
      done: true,
      value: 6,
    });
  });

  test("handles zero count", () => {
    const countCollector = new CountCollector<number>();
    expect(countCollector.collectPartCount(0)).toEqual({ done: false });
    expect(countCollector.collectPartCount(null)).toEqual({
      done: true,
      value: 0,
    });
  });

  test("handles null immediately", () => {
    const countCollector = new CountCollector<number>();
    expect(countCollector.collectPartCount(null)).toEqual({
      done: true,
      value: 0,
    });
  });
});
