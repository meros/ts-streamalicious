import StatelessTransformingStreamable from "./StatelessTransformingStreamable";
import ArrayStreamable from "./ArrayStreamable";
import * as statelesstransforms from "../statelesstransforms";

test("simple", () => {
  const arrayStreamable = new ArrayStreamable([1, 2, 3, 4, 5]);

  const statelessTransformingStreamable = new StatelessTransformingStreamable(
    arrayStreamable,
    statelesstransforms.syncTransform((n) => -n)
  );

  statelessTransformingStreamable.requestPart((result) => {
    expect(result).toEqual([-1, -2, -3, -4, -5]);
  });
});
