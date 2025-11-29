import ArrayCollector from "./ArrayCollector";

test("simple", () => {
  const arrayCollector = new ArrayCollector<number>();
  expect(arrayCollector.collectPart([1, 2, 3])).toEqual({ done: false });
  expect(arrayCollector.collectPart([4, 5, 6])).toEqual({ done: false });
  expect(arrayCollector.collectPart(null)).toEqual({
    done: true,
    value: [1, 2, 3, 4, 5, 6],
  });
});

test("empty", () => {
  const arrayCollector = new ArrayCollector<number>();
  expect(arrayCollector.collectPart(null)).toEqual({
    done: true,
    value: [],
  });
});

test("emptyparts", () => {
  const arrayCollector = new ArrayCollector<number>();
  expect(arrayCollector.collectPart([])).toEqual({ done: false });
  expect(arrayCollector.collectPart(null)).toEqual({
    done: true,
    value: [],
  });
});

test("getHints returns needsValues: true and needsOrdering: true", () => {
  const arrayCollector = new ArrayCollector<number>();
  const hints = arrayCollector.getHints();
  expect(hints.needsValues).toBe(true);
  expect(hints.needsOrdering).toBe(true);
});
