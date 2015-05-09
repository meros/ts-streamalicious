module streamalicious.core.asyncqueue {
	interface AsyncQueueOperation<T> {
		(callback: Consumer<T>): void;
	}

	interface AsyncQueueJob<T> {
		value: T;
		done: boolean;
		callback: Consumer<T>;
	}

	interface AsyncQueueReadyForMoreCallback {
		(): void;
	}

	export class AsyncQueue<T> {
		private maxLength: number;
		private queue: AsyncQueueJob<T>[] = [];
		private readyForMore: AsyncQueueReadyForMoreCallback = null;

		constructor(maxLength: number) {
			this.maxLength = maxLength;
		}

		private operationDone(job: AsyncQueueJob<T>, value: T) {
			job.done = true;
			job.value = value;

			this.updateQueue();
		}

		private updateQueue() {
			var readyForMore = this.readyForMore;

			while (this.queue.length) {
				if (!this.queue[0].done) {
					break;
				}

				var job = this.queue.shift();
				job.callback(job.value);
			}

			if (this.queue.length < this.maxLength && readyForMore) {
				this.readyForMore = null;
				readyForMore();
			}
		}

		public push(operation: AsyncQueueOperation<T>, callback: Consumer<T>, readyForMore: AsyncQueueReadyForMoreCallback) {
			var job: AsyncQueueJob<T> = {
				value: null,
				done: false,
				callback: callback
			};

			this.queue.push(job);
			operation((value: T) => {
				this.operationDone(job, value);
			});

			if (this.queue.length < this.maxLength) {
				readyForMore();
			} else {
				this.readyForMore = readyForMore;
			}
		}
	}
}

module streamalicious.core {
	export interface Consumer<T> {
		(value: T): void;
	}

	export interface Streamable<T> {
		requestPart(callback: Consumer<T[]>);
	}

	export interface CollectorCollectPartResult<T> {
		done: boolean;
		value?: T;
	}

	export interface Collector<T, U> {
		collectPart(part: T[]): CollectorCollectPartResult<U>;
	}

	export interface StatelessTransformer<T, U> {
		transformPart(part: T[], callback: Consumer<U[]>): void;
	}

	class StatelessTransformingStreamable<T, U> implements Streamable<U>{
		private transformer: StatelessTransformer<T, U>;
		private streamable: Streamable<T>;
		constructor(streamable: Streamable<T>, transformer: StatelessTransformer<T, U>) {
			this.transformer = transformer;
			this.streamable = streamable;
		}

		requestPart(callback: Consumer<U[]>) {
			this.streamable.requestPart((part: T[]) => {
				this.transformer.transformPart(part, callback);
			})
		}
	}

	export class CoreStream<T> {
		private streamable: Streamable<T>

		constructor(streamable: Streamable<T>) {
			this.streamable = streamable;
		}

		statelessTransform<U>(transformer: StatelessTransformer<T, U>): CoreStream<U> {
			return new CoreStream<U>(new StatelessTransformingStreamable<T, U>(this.streamable, transformer));
		}

		collect<U>(collector: Collector<T, U>, callback: Consumer<U>) {
			// Bootstrap the collecting
			this.collectPart({
				// TODO: need to be able to set max paralell calls from the outside somehow!
				queue: new asyncqueue.AsyncQueue<T[]>(100),
				collector: collector,
				callback: callback,
				done: false
			});
		}

		private collectPart<U>(state: { queue: asyncqueue.AsyncQueue<T[]>; collector: Collector<T, U>; callback: Consumer<U>; done: boolean }) {
			state.queue.push(
				// Operation to do
				(callback: Consumer<T[]>) => {
					this.streamable.requestPart(callback);
				},
				// A value is delivered (these are called in order)
				(part: T[]) => {
					if (!state.done) {
						var result = state.collector.collectPart(part);
						state.done = result.done || !part;
						if (result.done) {
							// Since we are done, lets call the initiator of the collection operation
							state.callback(result.value);
						}
					}
				},
				// What to do when there is more space in the queue
				() => {
					if (!state.done) {
						this.collectPart(state);
					}
				});
		}
	}
}

module streamalicious {
	export class Stream<T> extends core.CoreStream<T> {
		constructor(streamable: core.Streamable<T>) {
			super(streamable);
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
	class StringDuplicationTransform implements core.StatelessTransformer<string, string> {
		transformPart(part: string[], callback: streamalicious.core.Consumer<string[]>): void {
			callback(part ? part.map((value) => { return value + value }) : part);
		}
	}

	export function stringDuplication(): core.StatelessTransformer<string, string> {
		return new StringDuplicationTransform;
	}

	class SleepingNoopTransform<T> implements core.StatelessTransformer<T, T> {
		transformPart(part: T[], callback: streamalicious.core.Consumer<T[]>): void {
			console.log("Sleeping 1000 ms");
			setTimeout(() => {
				callback(part);
			}, 1000);
		}
	}

	export function debugSleepingNoopTransform<T>(): core.StatelessTransformer<T, T> {
		return new SleepingNoopTransform<T>();
	}

	interface AsyncTransformerOperation<T, U> {
		(value: T, callback: streamalicious.core.Consumer<U>): void;
	}

	class AsyncTransformer<T, U> implements streamalicious.core.StatelessTransformer<T, U> {
		private operation: AsyncTransformerOperation<T, U>;
		constructor(operation: AsyncTransformerOperation<T, U>) {
			this.operation = operation;
		}

		transformPart(part: T[], callback: streamalicious.core.Consumer<U[]>): void {
			if (!part) {
				callback(null);
			} else {
				var count = part.length;
				var result: U[] = [];
				for (var i = 0, len = part.length; i < len; i++) {

					var closure = (index: number) => {
						this.operation(part[index], (value: U) => {
							result[index] = value;
							count--;
							if (count === 0) {
								callback(result);
							}
						});
					};

					closure(i);
				}
			}
		}
	}

	export function asyncTransform<T, U>(operation: AsyncTransformerOperation<T, U>): core.StatelessTransformer<T, U> {
		return new AsyncTransformer<T, U>(operation);
	}
}

declare function require(name: string): any;
var request = require('request');

var urlStatusCheckTransform = streamalicious.statelesstransforms.asyncTransform(
	(url: string, callback: streamalicious.core.Consumer<number>) =>
		request(url, (error, response, body) => callback(response ? response.statusCode : 42)));
		
var test = streamalicious.streams.fromArray(
	["http://www.google.com",
		"http://www.yahoo.com",
		"http://www.google.com",
		"http://www.yahoo.com",
		"http://www.google.com",
		"http://www.yahoo.com",
		"http://www.google.com",
		"http://www.yahoo.com",
		"http://www.google.com",
		"http://www.yahoo.com",
		"http://www.aöskldjföajiowej.se"]).
	statelessTransform(urlStatusCheckTransform).
	collect(streamalicious.collectors.toArray(), (result) => {
	console.log("Statuses are: " + result);
});



