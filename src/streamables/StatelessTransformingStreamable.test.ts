import StatelessTransformingStreamable from "./StatelessTransformingStreamable";
import ArrayStreamable from "./ArrayStreamable";
import * as statelesstransforms from "../statelesstransforms";
import * as types from "../types";

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

describe("requestPartCount (pull-based optimization)", () => {
  test("delegates to upstream when upstream supports requestPartCount", (done) => {
    const arrayStreamable = new ArrayStreamable([1, 2, 3, 4, 5]);

    const statelessTransformingStreamable = new StatelessTransformingStreamable(
      arrayStreamable,
      statelesstransforms.syncTransform((n) => -n)
    );

    statelessTransformingStreamable.requestPartCount((count) => {
      expect(count).toBe(5);
      done();
    });
  });

  test("exhaust returns null", (done) => {
    const arrayStreamable = new ArrayStreamable([1, 2, 3, 4, 5]);

    const statelessTransformingStreamable = new StatelessTransformingStreamable(
      arrayStreamable,
      statelesstransforms.syncTransform((n) => -n)
    );

    statelessTransformingStreamable.requestPartCount((count) => {
      expect(count).toBe(5);
      statelessTransformingStreamable.requestPartCount((count) => {
        expect(count).toEqual(null);
        done();
      });
    });
  });

  test("falls back to requestPart when upstream doesn't support requestPartCount", (done) => {
    // Create a minimal streamable without requestPartCount
    const customStreamable: types.Streamable<number> = {
      requestPart: (callback: types.Consumer<number[] | null>) => {
        callback([1, 2, 3, 4, 5]);
      },
    };

    const statelessTransformingStreamable = new StatelessTransformingStreamable(
      customStreamable,
      statelesstransforms.syncTransform((n) => -n)
    );

    statelessTransformingStreamable.requestPartCount((count) => {
      expect(count).toBe(5);
      done();
    });
  });

  test("fallback returns null for null upstream part", (done) => {
    const customStreamable: types.Streamable<number> = {
      requestPart: (callback: types.Consumer<number[] | null>) => {
        callback(null);
      },
    };

    const statelessTransformingStreamable = new StatelessTransformingStreamable(
      customStreamable,
      statelesstransforms.syncTransform((n) => -n)
    );

    statelessTransformingStreamable.requestPartCount((count) => {
      expect(count).toEqual(null);
      done();
    });
  });
});
