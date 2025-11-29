import JoiningCollector from "./JoiningCollector";

test("simple", () => {
  const joiningCollector = new JoiningCollector(" ");
  expect(joiningCollector.collectPart(["Hello"])).toEqual({ done: false });
  expect(joiningCollector.collectPart(["World"])).toEqual({ done: false });
  expect(joiningCollector.collectPart(null)).toEqual({
    done: true,
    value: "Hello World",
  });
});

test("empty", () => {
  const joiningCollector = new JoiningCollector(" ");
  expect(joiningCollector.collectPart(null)).toEqual({
    done: true,
    value: "",
  });
});

test("multiple strings in one part", () => {
  const joiningCollector = new JoiningCollector(" ");
  expect(joiningCollector.collectPart(["Hello", "World"])).toEqual({
    done: false,
  });
  expect(joiningCollector.collectPart(null)).toEqual({
    done: true,
    value: "Hello World",
  });
});

test("getHints returns needsValues: true and needsOrdering: true", () => {
  const joiningCollector = new JoiningCollector(" ");
  const hints = joiningCollector.getHints();
  expect(hints.needsValues).toBe(true);
  expect(hints.needsOrdering).toBe(true);
});
