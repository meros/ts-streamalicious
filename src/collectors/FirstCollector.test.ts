import FirstCollector from "./FirstCollector";

test("simple - returns first element immediately", () => {
  const firstCollector = new FirstCollector<number>();
  // Should return done=true immediately when first element is found
  expect(firstCollector.collectPart([1, 2, 3])).toEqual({
    done: true,
    value: 1,
  });
});

test("multiple parts - returns first element from first non-empty part", () => {
  const firstCollector = new FirstCollector<number>();
  // First part is empty
  expect(firstCollector.collectPart([])).toEqual({ done: false });
  // Second part has elements - should return first one
  expect(firstCollector.collectPart([4, 5, 6])).toEqual({
    done: true,
    value: 4,
  });
});

test("empty stream - returns undefined", () => {
  const firstCollector = new FirstCollector<number>();
  expect(firstCollector.collectPart(null)).toEqual({
    done: true,
    value: undefined,
  });
});

test("empty parts then null - returns undefined", () => {
  const firstCollector = new FirstCollector<number>();
  expect(firstCollector.collectPart([])).toEqual({ done: false });
  expect(firstCollector.collectPart([])).toEqual({ done: false });
  expect(firstCollector.collectPart(null)).toEqual({
    done: true,
    value: undefined,
  });
});

test("already found - returns cached result", () => {
  const firstCollector = new FirstCollector<number>();
  expect(firstCollector.collectPart([1, 2])).toEqual({
    done: true,
    value: 1,
  });
  // If called again (shouldn't happen normally), still returns same result
  expect(firstCollector.collectPart([3, 4])).toEqual({
    done: true,
    value: 1,
  });
});

test("works with different types", () => {
  const stringCollector = new FirstCollector<string>();
  expect(stringCollector.collectPart(["hello", "world"])).toEqual({
    done: true,
    value: "hello",
  });

  const objectCollector = new FirstCollector<{ id: number }>();
  expect(objectCollector.collectPart([{ id: 1 }, { id: 2 }])).toEqual({
    done: true,
    value: { id: 1 },
  });
});
