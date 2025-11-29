import * as statelesstransforms from ".";
import * as streamables from "../streamables";

describe("statelesstransforms index", () => {
  // Modern Promise-based async API tests
  describe("Modern Promise-based API", () => {
    test("promiseTransform wraps values in arrays", (done) => {
      const transformer = statelesstransforms.promiseTransform<number, number>(
        async (val) => val * 2
      );

      transformer.transformPart([1, 2, 3], (result) => {
        expect(result).toEqual([2, 4, 6]);
        done();
      });
    });

    test("promiseTransform with delayed resolution", (done) => {
      const transformer = statelesstransforms.promiseTransform<number, number>((val) => {
        return new Promise((resolve) => setTimeout(() => resolve(val * 2), 10));
      });

      transformer.transformPart([1, 2, 3], (result) => {
        expect(result).toEqual([2, 4, 6]);
        done();
      });
    });

    test("promiseFlatMap flattens stream results", (done) => {
      const transformer = statelesstransforms.promiseFlatMap<number[], number>(async (arr) => {
        return streamables.fromArray(arr);
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

    test("promiseFlatMap with delayed stream creation", (done) => {
      const transformer = statelesstransforms.promiseFlatMap<number[], number>((arr) => {
        return new Promise((resolve) => setTimeout(() => resolve(streamables.fromArray(arr)), 10));
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
  });

  // Legacy callback-based API tests
  describe("Legacy callback-based API", () => {
    test("asyncTransform wraps values in arrays", (done) => {
      const transformer = statelesstransforms.asyncTransform<number, number>((val, cb) =>
        cb(val * 2)
      );

      transformer.transformPart([1, 2, 3], (result) => {
        expect(result).toEqual([2, 4, 6]);
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
  });

  // Sync transforms (unchanged)
  describe("Sync transforms", () => {
    test("syncTransform converts sync function to async", (done) => {
      const transformer = statelesstransforms.syncTransform<number, string>((val) =>
        val.toString()
      );

      transformer.transformPart([1, 2, 3], (result) => {
        expect(result).toEqual(["1", "2", "3"]);
        done();
      });
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
});
