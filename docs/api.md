# API reference

The package currently exports one sample function from its root: `createGreeting`. This sample is not the EliD OAuth 2.1 client API.

## `createGreeting`

```ts
createGreeting(name?: string): string
```

Create a greeting for a name.

| Input  | Type     | Required | Description                                  |
| ------ | -------- | -------- | -------------------------------------------- |
| `name` | `string` | No       | The name to include. The default is `world`. |

The function returns `Hello, <name>!`. If you omit `name` or pass `undefined`, the function uses `world`. The function keeps the supplied string as written.

```js
import { createGreeting } from "@eliware/elid-client";

createGreeting("Eli"); // "Hello, Eli!"
createGreeting(); // "Hello, world!"
createGreeting(""); // "Hello, !"
createGreeting(" Eli "); // "Hello,  Eli !"
```

The package root is the documented import path. The package does not expose internal source paths as public imports.

## TypeScript

The package includes `src/index.d.ts` as its TypeScript declaration. The declaration describes an optional string input and a string result.

```ts
import { createGreeting } from "@eliware/elid-client";

const greeting: string = createGreeting("Eli");
```
