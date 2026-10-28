# API reference

The package currently exports one sample function from its root: `createGreeting`. This scaffold sample is not the EliD OAuth 2.1 client API.

## `createGreeting`

```ts
createGreeting(name?: string, options?: { logger?: LoggerWithConfiguredLevels }): string
```

Create a greeting for a name and log a structured operation record.

| Input            | Type                         | Required | Description                                       |
| ---------------- | ---------------------------- | -------- | ------------------------------------------------- |
| `name`           | `string`                     | No       | The name to include. The default is `world`.      |
| `options.logger` | `LoggerWithConfiguredLevels` | No       | The logger to use. The default is `@eliware/log`. |

The function returns `Hello, <name>!`. It keeps the supplied string as written. It does not include the name in the log record.

```js
import { createGreeting } from "@eliware/elid-client";
import { createLogger } from "@eliware/log";

const logger = createLogger({ format: "json" });
createGreeting("Eli", { logger });
```

The function calls the logger's `info` method with `Greeting created` and an `operation` field set to `createGreeting`. The logger supports `error`, `warn`, `info`, `http`, `verbose`, `debug`, and `silly` levels.

The package root is the documented import path. The package does not expose internal source paths as public imports.

## TypeScript

The package declaration imports `LoggerWithConfiguredLevels` from `@eliware/log`.

```ts
import { createGreeting } from "@eliware/elid-client";

const greeting: string = createGreeting("Eli");
```
