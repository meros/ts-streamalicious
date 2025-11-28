import * as statelesstransforms from ".";
import * as streamables from "../streamables";

describe("statelesstransforms index", () => {
  test("asyncTransform wraps values in arrays", (done) => {
    const transformer = statelesstransforms.asyncTransform<number, number>((val, cb) =>
      cb(val * 2)
    );

    transformer.transformPart([1, 2, 3], (result) => {
      expect(result).toEqual([2, 4, 6]);
      done();
    });
  });

  test("syncTransform converts sync function to async", (done) => {
    const transformer = statelesstransforms.syncTransform<number, string>((val) => val.toString());

    transformer.transformPart([1, 2, 3], (result) => {
      expect(result).toEqual(["1", "2", "3"]);
      done();
    });
  });

  test("asyncFlatMap flattens stream results", (done) => {
    const transformer = statelesstransforms.asyncFlatMap<number[], number>((arr, cb) => {
      cb(streamables.fromArray(arr));
    });

    transformer.transformPart(
      [
        [1, 2],
        [3, 4],
      ],
      (result) => {
        expect(result).toEqual([1, 2, 3, 4]);
        done();
      }
    );
  });

  test("syncFlatMap flattens stream results synchronously", (done) => {
    const transformer = statelesstransforms.syncFlatMap<number[], number>((arr) =>
      streamables.fromArray(arr)
    );

    transformer.transformPart(
      [
        [1, 2],
        [3, 4],
      ],
      (result) => {
        expect(result).toEqual([1, 2, 3, 4]);
        done();
      }
    );
  });
});
