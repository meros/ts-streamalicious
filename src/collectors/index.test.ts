import * as collectors from ".";

import ArrayCollector from "./ArrayCollector";
import FirstCollector from "./FirstCollector";
import JoiningCollector from "./JoiningCollector";
import CountCollector from "./CountCollector";

test("ArrayCollector", () => {
  expect(collectors.toArray()).toBeInstanceOf(ArrayCollector);
});

test("CountingCollector", () => {
  expect(collectors.toCount()).toBeInstanceOf(CountCollector);
});

test("FirstCollector", () => {
  expect(collectors.toFirst()).toBeInstanceOf(FirstCollector);
});

test("JoiningCollector", () => {
  expect(collectors.toJointString(" ")).toBeInstanceOf(JoiningCollector);
});
