# Streamalicious

[![Build Status](https://github.com/meros/ts-streamalicious/actions/workflows/ci.yml/badge.svg)](https://github.com/meros/ts-streamalicious/actions)

Async-first streaming library written in TypeScript.

## 🎮 Try It Out

**[Interactive Playground](https://meros.github.io/ts-streamalicious/)** - Experiment with the library directly in your browser!

## Motivation

Streams are nice and flexible for array processing, and async streams enable you to solve problems in a few lines that would normally be either serialized (slow) or complex.

JavaScript has stream-like behavior built in (array prototypes), but these are synchronous and directly connected to the Array prototype, which means they're not always usable for non-array stream-like objects (generators, async iterables, etc).

## ⚡ Automatic Parallel Processing

One of the unique strengths of this library is **automatic parallel execution** of async operations. When you have many items to process with async transforms (like network requests), they run in parallel automatically — no complex configuration needed.

### The Problem

Need to fetch 100 URLs? With traditional approaches, you either:
- Process them sequentially (slow - each request waits for the previous one)
- Use `Promise.all()` on all 100 (risky - may exhaust network connections or hit rate limits)
- Write complex concurrency management code

### The Solution

Streamalicious handles this automatically:

```typescript
import { streamables } from "@meros/streamalicious";

// Process 100 items with parallel async operations - simple and efficient!
const urls = Array.from({ length: 100 }, (_, i) => `https://api.example.com/item/${i}`);

const results = await streamables
  .fromArray(urls)
  .transform(async (url) => {
    const response = await fetch(url);
    return response.json();
  })
  .toArray();

// All 100 fetches run in parallel, results arrive in original order
console.log(results.length); // 100
```

### Benefits

- **Automatic parallelism**: Async operations run concurrently without manual orchestration
- **Order preservation**: Results always arrive in the original input order, regardless of completion time
- **Simple API**: No need to manage promises, queues, or concurrency limits manually
- **Efficient**: Much faster than sequential processing while being safer than unbounded parallelism

## Why TypeScript?

Stream libraries benefit heavily from type support.

Doing long chains of transform/filter/collect changes the type in an error-prone way. Using TypeScript, the fact that the type changes becomes a pro instead of a con - you get full type safety throughout your stream pipeline.

## Installation

```bash
npm install @meros/streamalicious
```

## Quick Start

The library uses modern async/await as its first-class API:

```typescript
import { streamables, collectors } from "@meros/streamalicious";

// Basic array processing - transform() works with both sync and async functions
const result = await streamables
  .fromArray([1, 2, 3, 4, 5])
  .transform((x) => x * 2) // sync function works!
  .toArray();
console.log(result); // [2, 4, 6, 8, 10]

// Async transformations with Promises
const squared = await streamables
  .fromArray([1, 2, 3])
  .transform(async (val) => {
    // Simulate async operation
    return val * val;
  })
  .toArray();
console.log(squared); // [1, 4, 9]

// Mix sync and async transforms seamlessly
const mixed = await streamables
  .fromArray([1, 2, 3])
  .transform((x) => x * 2) // sync
  .transform(async (x) => x + 1) // async
  .transform((x) => x.toString()) // sync
  .toArray();
console.log(mixed); // ["3", "5", "7"]

// FlatMap operations
const flattened = await streamables
  .fromArray([[1, 2], [3], [4, 5]])
  .flatMap((arr) => streamables.fromArray(arr)) // works with sync too!
  .toArray();
console.log(flattened); // [1, 2, 3, 4, 5]

// Custom collectors with async/await
const joined = await streamables
  .fromArray([1, 2, 3, 4, 5])
  .transform((x) => x.toString())
  .collect(collectors.toJointString(", "));
console.log(joined); // "1, 2, 3, 4, 5"

// Count elements
const count = await streamables
  .fromArray([1, 2, 3, 4, 5])
  .count();
console.log(count); // 5
```

## API

### Streamables

- `streamables.fromArray<T>(array: T[])` - Create a stream from an array

### Stream Methods (Modern async/await API)

These are the primary, first-class methods that return Promises:

- `.transform<U>(fn: (value: T) => U | Promise<U>)` - Transform each element (accepts both sync and async functions)
- `.transformSync<U>(fn: (value: T) => U)` - Transform each element synchronously (slightly more efficient for pure sync transforms)
- `.flatMap<U>(fn: (value: T) => Stream<U> | Promise<Stream<U>>)` - FlatMap (accepts both sync and async functions)
- `.flatMapSync<U>(fn: (value: T) => Stream<U>)` - FlatMap synchronously (slightly more efficient for pure sync transforms)
- `.collect<U>(collector: Collector<T, U>): Promise<U>` - Collect with custom collector
- `.toArray(): Promise<T[]>` - Collect all elements to array
- `.count(): Promise<number>` - Count all elements

### Legacy Callback-based API (Deprecated)

These callback-based methods are preserved for backwards compatibility:

- `.transformCb<U>(fn: (value: T, callback: (result: U) => void) => void)` - Async transform with callback
- `.flatMapCb<U>(fn: (value: T, callback: (stream: Stream<U>) => void) => void)` - Async flatMap with callback
- `.collectCb<U>(collector: Collector<T, U>, callback: (result: U) => void)` - Collect with callback
- `.toArrayCb(callback: (result: T[]) => void)` - Collect to array with callback
- `.countCb(callback: (count: number) => void)` - Count with callback

### Collectors

- `collectors.toArray<T>()` - Collect elements into an array
- `collectors.toCount<T>()` - Count elements
- `collectors.toJointString(separator: string)` - Join strings with separator

## Migration from Callback API

If you're upgrading from an older version that used callback-based APIs, here's how to migrate:

**Before (callback-based):**
```typescript
streamables
  .fromArray([1, 2, 3])
  .transform((val, callback) => {
    callback(val * 2);
  })
  .toArray((result) => {
    console.log(result);
  });
```

**After (async/await):**
```typescript
const result = await streamables
  .fromArray([1, 2, 3])
  .transform(async (val) => val * 2)
  .toArray();
console.log(result);
```

The callback-based methods are still available with the `Cb` suffix for backwards compatibility.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format

# Build and serve playground locally
npm run playground:dev
```

## License

ISC
