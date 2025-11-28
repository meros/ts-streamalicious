import ArrayStreamable from "./ArrayStreamable";

test("simple", (done) => {
  const arrayStreamable = new ArrayStreamable<number>([1, 2, 3, 4, 5, 6]);
  arrayStreamable.requestPart((result) => {
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    done();
  });
});

test("exhaust", (done) => {
  const arrayStreamable = new ArrayStreamable<number>([1, 2, 3, 4, 5, 6]);
  arrayStreamable.requestPart((result) => {
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    arrayStreamable.requestPart((result) => {
      expect(result).toEqual(null);
      done();
    });
  });
});

test("empty", (done) => {
  const arrayStreamable = new ArrayStreamable<number>(null);
  arrayStreamable.requestPart((result) => {
    expect(result).toEqual(null);
    done();
  });
});
