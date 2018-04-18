import * as types from "../types";

interface AsyncQueueOperation<T> {
  (callback: types.Consumer<T>): void;
}

interface AsyncQueueJob<T> {
  value: T;
  done: boolean;
  callback: types.Consumer<T>;
}

interface AsyncQueueReadyForMoreCallback {
  (): void;
}

// This class is mostly used to initiate multiple getPart requests upstream
// (remember we don't know how many parts there are) but always deliver the
// result in order. It's good for collecting results that can run in parallell
// but by nature takes some time to compute/look up.
export default class AsyncQueue<T> {
  private maxLength: number;
  private queue: AsyncQueueJob<T>[] = [];
  private onReadyForMore: AsyncQueueReadyForMoreCallback;

  constructor(maxLength: number, readyForMore: AsyncQueueReadyForMoreCallback) {
    this.maxLength = maxLength;
    this.onReadyForMore = readyForMore;
  }

  // Push another operation on the queue, callback is called (in strict order
  // of calling this function) when results are in, readyForMore is called
  // when there are less than maxLength outstanding operations (and queue can
  // start more)
  public push(operation: AsyncQueueOperation<T>, callback: types.Consumer<T>) {
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
      this.onReadyForMore();
    }
  }

  private operationDone(job: AsyncQueueJob<T>, value: T) {
    job.done = true;
    job.value = value;

    this.updateQueue();
  }

  private updateQueue() {
    while (this.queue.length) {
      if (!this.queue[0].done) {
        break;
      }

      var job = this.queue.shift();
      job.callback(job.value);
    }

    if (this.queue.length < this.maxLength) {
      this.onReadyForMore();
    }
  }
}
