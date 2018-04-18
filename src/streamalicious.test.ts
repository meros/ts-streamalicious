import * as streamalicious from "./streamalicious";

test("Array source and collect", done => {
  var result: number[];
  streamalicious.streamables
    .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .toArray(result => {
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      done();
    });
});

test("Array source and count", done => {
  streamalicious.streamables
    .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .count(count => {
      expect(count).toEqual(10);
      done();
    });
});

test("Array source and simple transform - async", done => {
  streamalicious.streamables
    .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .transform((val: number, callback: streamalicious.types.Consumer<number>) =>
      callback(val * val)
    )
    .toArray(array => {
      expect(array).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
      done();
    });
});

test("Array source and simple transform - sync", done => {
  streamalicious.streamables
    .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .transformSync(val => {
      return val * val;
    })
    .toArray(array => {
      expect(array).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
      done();
    });
});

test("Array of array source and flatmap - async", done => {
  streamalicious.streamables
    .fromArray([[1, 2], [3], [4, 5, 6, 7], [], [8, 9, 10]])
    .flatMap<number>(
      (
        value: number[],
        callback: streamalicious.types.Consumer<streamalicious.Stream<number>>
      ) => {
        callback(streamalicious.streamables.fromArray(value));
      }
    )
    .toArray(array => {
      expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      done();
    });
});

test("Array of array source and flatmap - sync", done => {
  streamalicious.streamables
    .fromArray([[1, 2], [3], [4, 5, 6, 7], [], [8, 9, 10]])
    .flatMapSync<number>((value: number[]) => {
      return streamalicious.streamables.fromArray(value);
    })
    .toArray(array => {
      expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      done();
    });
});

test("Array of array source and string joining collector", done => {
  streamalicious.streamables
    .fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .transform(
      (value: number, callback: streamalicious.types.Consumer<string>) => {
        callback(value.toString());
      }
    )
    .collect(
      streamalicious.collectors.toJointString(", "),
      (jointString: string) => {
        expect(jointString).toEqual("1, 2, 3, 4, 5, 6, 7, 8, 9, 10");
        done();
      }
    );
});
