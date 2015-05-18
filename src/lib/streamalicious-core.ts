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
			// Bootstrap the collecting
			this.collectPart({
				// TODO: need to be able to set max paralell calls from the outside somehow!
				queue: new asyncqueue.AsyncQueue<T[]>(50),
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