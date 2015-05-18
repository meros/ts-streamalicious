/// <reference path="./streamalicious-core.ts" />

module streamalicious {
	export class Stream<T> {
		private coreStream: core.CoreStream<T>;
		constructor(streamable: core.Streamable<T>) {
			this.coreStream = new core.CoreStream(streamable);
		}
		
		// Generic
		public transform<U>(transform: statelesstransforms.AsyncTransformerOperation<T, U>) {
			return this.coreStream.coreStatelessTransform(
				statelesstransforms.asyncTransform(transform),
				Stream.create);
		}

		public transformSync<U>(transform: statelesstransforms.SyncTransformerOperation<T, U>) {
			return this.coreStream.coreStatelessTransform(
				statelesstransforms.syncTransform(transform),
				Stream.create);
		}

		public collect<U>(collector: core.Collector<T, U>, callback: core.Consumer<U>) {
			this.coreStream.coreCollect(collector, callback);
		}
		
		// Utility
		public toArray(callback: core.Consumer<T[]>) {
			this.collect(collectors.toArray<T>(), callback);
		}
		
		public count(callback: core.Consumer<number>) {
			this.collect(collectors.toCount(), callback);
		}

		private static create<U>(streamable: core.Streamable<U>): Stream<U> {
			return new Stream<U>(streamable);
		}
	}
}

module streamalicious.streams {
	class ArrayStreamable<T> implements core.Streamable<T>{
		private array: T[];

		constructor(array: T[]) {
			this.array = array;
		}

		public requestPart(callback: core.Consumer<T[]>) {
			callback(this.array);
			this.array = null;
		}
	}

	export function fromArray<T>(array: T[]): Stream<T> {
		return new Stream<T>(new ArrayStreamable(array));
	}

	class SleepIncrementerStreamable implements core.Streamable<number>{
		private value: number = 0;
		private maxValue: number;

		constructor(maxValue: number) {
			this.maxValue = maxValue;
		}

		public requestPart(callback: core.Consumer<number[]>) {
			var currentValue = this.value++;
			if (currentValue > 100) {
				callback(null);
			} else {
				setTimeout(() => {
					callback([currentValue]);
				}, Math.random() * 1000);
			}
		}
	}

	export function debugSleepIncremeneter(maxValue: number): Stream<number> {
		return new Stream<number>(new SleepIncrementerStreamable(maxValue));
	}
}

module streamalicious.collectors {
	class CountCollector<T> implements streamalicious.core.Collector<T, number> {
		private count: number = 0;

		public collectPart(part: T[]): streamalicious.core.CollectorCollectPartResult<number> {
			if (!part) {
				// I am done...
				return { done: true, value: this.count };
			}
		
			// Add to count and keep going!
			this.count += part.length;
			return { done: false };
		}
	}

	class ArrayCollector<T> implements streamalicious.core.Collector<T, T[]> {
		private result: T[] = [];

		public collectPart(part: T[]): streamalicious.core.CollectorCollectPartResult<T[]> {
			if (!part) {
				// I am done...
				return { done: true, value: this.result };
			}

			// Add to result array and keep going
			this.result = this.result.concat(part);
			return { done: false };
		}
	}

	export function toCount<T>() {
		return new CountCollector<T>();
	}

	export function toArray<T>() {
		return new ArrayCollector<T>();
	}
}

module streamalicious.statelesstransforms {
	export interface AsyncTransformerOperation<T, U> {
		(value: T, callback: streamalicious.core.Consumer<U>): void;
	}

	export interface SyncTransformerOperation<T, U> {
		(value: T): U;
	}

	class AsyncTransformer<T, U> implements streamalicious.core.StatelessTransformer<T, U> {
		private waitingFor: { value: T; done: boolean; }[] = [];
		private debug = false;

		private operation: AsyncTransformerOperation<T, U>;
		constructor(operation: AsyncTransformerOperation<T, U>) {
			this.operation = operation;
		}

		private debugPrint() {
			if (!this.debug) {
				return;
			}

			console.log("--------------- Debug for async operation, outstanding transforms ---------------")
			console.log("Number of outstading: " + this.waitingFor.filter((value) => { return !value.done }).length);
			for (var i = 0, len = this.waitingFor.length; i < len; i++) {
				if (!this.waitingFor[i].done) {
					console.log(this.waitingFor[i].value);
				}
			}
			console.log("---------------------------------------------------------------------------------")
		}

		transformPart(part: T[], callback: streamalicious.core.Consumer<U[]>): void {
			if (!part) {
				callback(null);
			} else {
				var count = part.length;
				var result: U[] = [];
				for (var i = 0, len = part.length; i < len; i++) {
					((myIndex: number) => {
						var debugPart = { value: part[myIndex], done: false };
						this.waitingFor.push(debugPart);

						this.operation(part[myIndex], (value: U) => {
							debugPart.done = true;
							this.debugPrint();

							result[myIndex] = value;
							count--;
							if (count === 0) {
								callback(result);
							}
						});
					})(i);
				}
			}
		}
	}

	export function asyncTransform<T, U>(transform: AsyncTransformerOperation<T, U>): core.StatelessTransformer<T, U> {
		return new AsyncTransformer<T, U>(transform);
	}

	export function syncTransform<T, U>(transform: SyncTransformerOperation<T, U>): core.StatelessTransformer<T, U> {
		return new AsyncTransformer<T, U>((value, callback) => callback(transform(value)));
	}
}