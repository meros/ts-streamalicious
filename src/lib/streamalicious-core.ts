/// <reference path="./streamalicious-core-asyncqueue.ts" />


module streamalicious.core {
	export interface Consumer<T> {
		(value: T): void;
	}

	export interface Mapper<T, U> {
		(value: T): U;
	}

	export interface Streamable<T> {
		requestPart(callback: Consumer<T[]>): void;
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

		public coreStatelessTransform<U, V>(transformer: StatelessTransformer<T, U>, constructor: Mapper<Streamable<U>, V>): V {
			return constructor(new StatelessTransformingStreamable<T, U>(this.streamable, transformer));
		}

		public coreCollect<U>(collector: Collector<T, U>, callback: Consumer<U>) {
			var done: boolean = false;
			var queue = new asyncqueue.AsyncQueue<T[]>(50, () => {
				if (!done) {
					collectOne();
				}
			});
			var collectOne = () => {
				queue.push(
					// Operation to do
					(callback: Consumer<T[]>) => {
						this.streamable.requestPart(callback);
					},
					// A value is delivered (these are called in order)
					(part: T[]) => {
						if (!done) {
							var result = collector.collectPart(part);
							done = result.done || !part;
							if (done) {
								// Since we are done, lets call the initiator of the collection operation
								callback(result.value);
							}
						}
					});
			};
			
			// Boot strap collecting
			collectOne();
		}

	}
}