/// <reference path="jasmine.d.ts" />
/// <reference path="../lib/streamalicious.ts" />

describe("Simple test suite", () => {
  describe("Array source and collect", () => {
    var result: number[];

    beforeEach((done) => streamalicious.streams.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).
      toArray((array) => {
        result = array;
        done();
      }));

    it("should match original array", function() {
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe("Array source and count", () => {
    var result: number;

    beforeEach((done) => streamalicious.streams.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).
      count((count) => {
        result = count;
        done();
      }));

    it("should match count of original array", function() {
      expect(result).toEqual(10);
    });
  });

  describe("Array source and simple transform - async", () => {
    var result: number[];

    beforeEach((done) => streamalicious.streams.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).
      transform((val: number, callback: streamalicious.core.Consumer<number>) => callback(val * val)).
      toArray((array) => {
        result = array;
        done();
      }));

    it("should match original array squared", function() {
      expect(result).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
    });
  });

  describe("Array source and simple transform - sync", () => {
    var result: number[];

    beforeEach((done) => streamalicious.streams.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).
      transformSync((val) => { return val * val; }).
      toArray((array) => {
        result = array;
        done();
      }));

    it("should match original array squared", function() {
      expect(result).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
    });
  });

  describe("Array of array source and flatmap - async", () => {
    var result: number[];

    beforeEach((done) => streamalicious.streams.fromArray([[1, 2], [3], [4, 5, 6, 7], [], [8, 9, 10]]).
      flatMap<number>((value: number[], callback: streamalicious.core.Consumer<streamalicious.Stream<number>>) => {
        callback(streamalicious.streams.fromArray(value));
      }).toArray((array) => {
        result = array;
        done();
      }));

    it("should match original array flatmapped", function() {
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe("Array of array source and flatmap - sync", () => {
    var result: number[];

    beforeEach((done) => streamalicious.streams.fromArray([[1, 2], [3], [4, 5, 6, 7], [], [8, 9, 10]]).
      flatMapSync<number>((value: number[]) => {
        return streamalicious.streams.fromArray(value);
      }).toArray((array) => {
        result = array;
        done();
      }));

    it("should match original array flatmapped", function() {
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe("Array of array source and string joining collector", () => {
    var result: string;

    beforeEach((done) => streamalicious.streams.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).
      transform((value: number, callback: streamalicious.core.Consumer<string>) => {
        callback(value.toString());
      }).collect(streamalicious.collectors.toJointString(", "), (jointString: string) => {
        result = jointString;
        done();
      }));

    it("should match original array squared", function() {
      expect(result).toEqual("1, 2, 3, 4, 5, 6, 7, 8, 9, 10");
    });
  });
});
