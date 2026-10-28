# Usage

This repository provides an initial scaffold for `@eliware/elid-client`. The EliD OAuth 2.1 client API has not been implemented. The greeting function is sample code.

## Requirements

Use Node.js 26 or later to run the sample and validate this repository. Use an ESM project to import the sample API.

## Install development dependencies

Run this command from the repository root:

```sh
npm ci
```

## Run the sample

Run this command from the repository root:

```sh
node examples/basic.mjs
```

The command prints:

```text
Hello, Eli!
```

The example calls `createGreeting` with the name `Eli`. Read the [API reference](api.md) for details.

## Validate the repository

Run these commands from the repository root:

```sh
npm ci
npm test
npm run typecheck
npm run pack
```

`npm ci` installs locked dependencies. `npm test` runs aggregate repository checks. `npm run typecheck` checks the TypeScript declaration. `npm run pack` checks the files that npm includes in a package.

## Package status

The package metadata identifies the planned EliD client library. The current source exports only a greeting sample. Do not publish this scaffold as the completed OAuth 2.1 client.
