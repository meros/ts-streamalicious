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
