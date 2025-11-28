# Streamalicious

[![Build Status](https://github.com/meros/ts-streamalicious/actions/workflows/ci.yml/badge.svg)](https://github.com/meros/ts-streamalicious/actions)

Async-first streaming library written in TypeScript.

## 🎮 Try It Out

**[Interactive Playground](https://meros.github.io/ts-streamalicious/)** - Experiment with the library directly in your browser!

## Motivation

Streams are nice and flexible for array processing, and async streams enable you to solve problems in a few lines that would normally be either serialized (slow) or complex.

JavaScript has stream-like behavior built in (array prototypes), but these are synchronous and directly connected to the Array prototype, which means they're not always usable for non-array stream-like objects (generators, async iterables, etc).

## Why TypeScript?

Stream libraries benefit heavily from type support.

Doing long chains of transform/filter/collect changes the type in an error-prone way. Using TypeScript, the fact that the type changes becomes a pro instead of a con - you get full type safety throughout your stream pipeline.

## Installation

```bash
npm install @meros/streamalicious
```

## Quick Start

```typescript
import { streamables, collectors } from "@meros/streamalicious";

// Basic array processing
streamables
  .fromArray([1, 2, 3, 4, 5])
  .transformSync((x) => x * 2)
  .toArray((result) => {
    console.log(result); // [2, 4, 6, 8, 10]
  });

// Async transformations
streamables
  .fromArray([1, 2, 3])
  .transform((val, callback) => {
    setTimeout(() => callback(val * val), 100);
  })
  .toArray((result) => {
    console.log(result); // [1, 4, 9]
  });

// FlatMap operations
streamables
  .fromArray([[1, 2], [3], [4, 5]])
  .flatMapSync((arr) => streamables.fromArray(arr))
  .toArray((result) => {
    console.log(result); // [1, 2, 3, 4, 5]
  });

// Custom collectors
streamables
  .fromArray([1, 2, 3, 4, 5])
  .transformSync((x) => x.toString())
  .collect(collectors.toJointString(", "), (result) => {
    console.log(result); // "1, 2, 3, 4, 5"
  });
```

## API

### Streamables

- `streamables.fromArray<T>(array: T[])` - Create a stream from an array

### Stream Methods

- `.transform<U>(fn: (value: T, callback: (result: U) => void) => void)` - Async transform
- `.transformSync<U>(fn: (value: T) => U)` - Sync transform
- `.flatMap<U>(fn: (value: T, callback: (stream: Stream<U>) => void) => void)` - Async flatMap
- `.flatMapSync<U>(fn: (value: T) => Stream<U>)` - Sync flatMap
- `.collect<U>(collector: Collector<T, U>, callback: (result: U) => void)` - Collect with custom collector
- `.toArray(callback: (result: T[]) => void)` - Collect to array
- `.count(callback: (count: number) => void)` - Count elements

### Collectors

- `collectors.toArray<T>()` - Collect elements into an array
- `collectors.toCount<T>()` - Count elements
- `collectors.toJointString(separator: string)` - Join strings with separator

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
