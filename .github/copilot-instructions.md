# Copilot Instructions for ts-streamalicious

## Project Overview

Streamalicious is an async-first streaming library written in TypeScript. It provides type-safe stream processing with support for synchronous and asynchronous transformations, flatMap operations, and custom collectors.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check

# Build and serve playground locally
npm run playground:dev
```

## Code Style and Conventions

### TypeScript
- Use strict TypeScript (`"strict": true` in tsconfig.json)
- Target ES2020
- Use CommonJS modules
- Always provide explicit types for function parameters
- Prefix unused parameters with underscore (e.g., `_unusedParam`)

### Formatting (Prettier)
- Use double quotes for strings
- Use semicolons
- 2-space indentation
- Trailing commas in ES5-compatible positions
- 100 character line width
- Always use parentheses around arrow function parameters

### Linting (ESLint)
- Follow eslint:recommended and @typescript-eslint/recommended rules
- `@typescript-eslint/no-explicit-any` is a warning (prefer typed alternatives)
- Unused variables are errors (except parameters prefixed with `_`)

## Project Structure

```
src/
├── Stream.ts          # Core Stream class with transform/collect methods
├── Stream.test.ts     # Tests for Stream class
├── streamables/       # Stream creation utilities (e.g., fromArray)
├── collectors/        # Collector implementations (toArray, toCount, toJointString)
├── statelesstransforms/ # Stateless transformation utilities
├── core/              # Core functionality
├── types.ts           # TypeScript type definitions
├── streamalicious.ts  # Main export file
└── streamalicious.test.ts # Integration tests
```

## Testing Guidelines

- Use Jest for testing with ts-jest preset
- Test files are named `*.test.ts` alongside source files
- Use `done` callback for async stream operations
- Tests should be placed in the same directory as the source file being tested
- All tests must pass before merging

### Example Test Pattern

```typescript
import * as streamables from "./streamables";

describe("Feature name", () => {
  test("descriptive test name", (done) => {
    streamables
      .fromArray([1, 2, 3])
      .transformSync((x) => x * 2)
      .toArray((result) => {
        expect(result).toEqual([2, 4, 6]);
        done();
      });
  });
});
```

## API Design Patterns

### Async Callbacks
The library uses callback-based async APIs:
```typescript
.transform<U>((value, callback) => {
  // Async operation
  callback(result);
})
```

### Sync Operations
Sync operations use the `Sync` suffix:
```typescript
.transformSync<U>((value) => result)
.flatMapSync<U>((value) => stream)
```

### Collectors
Custom collectors follow the Collector interface pattern:
```typescript
collectors.toArray<T>()
collectors.toCount<T>()
collectors.toJointString(separator)
```

## CI/CD

The project runs CI on Node.js 18.x and 20.x with:
1. Dependency installation (`npm ci`)
2. Build (`npm run build`)
3. Lint (`npm run lint`)
4. Format check (`npm run format:check`)
5. Tests (`npm test`)

All checks must pass before merging.

## Playground

An interactive browser-based playground is available at https://meros.github.io/ts-streamalicious/. The playground bundle is auto-generated and should not be manually edited.
