import * as collectors from ".";

import ArrayCollector from "./ArrayCollector";
import JoiningCollector from "./JoiningCollector";
import CountCollector from "./CountCollector";

test("ArrayCollector", () => {
  expect(collectors.toArray()).toBeInstanceOf(ArrayCollector);
});

test("CountingCollector", () => {
  expect(collectors.toCount()).toBeInstanceOf(CountCollector);
});

test("JoiningCollector", () => {
  expect(collectors.toJointString(" ")).toBeInstanceOf(JoiningCollector);
});
