# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/elid-client [![npm version](https://img.shields.io/npm/v/@eliware/elid-client.svg)](https://www.npmjs.com/package/@eliware/elid-client) [![license](https://img.shields.io/github/license/eliware/elid-client.svg)](LICENSE) [![CI](https://github.com/eliware/elid-client/actions/workflows/ci.yml/badge.svg)](https://github.com/eliware/elid-client/actions/workflows/ci.yml)

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [API](#api)
- [Packaging](#packaging)
- [Examples](#examples)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Features

Purpose: @eliware/elid-client is the planned Node.js SDK for integrating Eliware applications with EliD.

The package description is: Node.js OAuth 2.1 client library for EliD issuer discovery, PKCE authentication, token exchange, and session management.

- Provides a small, tested native ESM library surface.
- Includes public declarations, examples, documentation, and release notes.
- Uses shared validation scripts and an explicit package contents allowlist.

Maintained by Eliware <eliware@eliware.org>. Author: Eliware <eliware@eliware.org>. License: MIT. See [LICENSE](LICENSE).

Documentation: [docs](docs/README.md) · [specifications](specs/README.md) · [examples](examples/README.md)

## Requirements

- Node.js 26.x with native ESM support.
- No environment variables or runtime configuration files are required.

## Setup

Run npm install @eliware/elid-client to install the package. This checkout declares version 9.0.0 in package.json; verify the exact release in the npm registry before installing that version. The public runtime entrypoint is src/index.mjs and declarations are in index.d.ts.

### Configuration

The current sample API has no runtime settings, environment variables, or configuration files. Document any runtime configuration introduced by the EliD client API when it is defined; package metadata and deployment settings are not runtime configuration.

## Usage

Import the public function from @eliware/elid-client:

```js
import { createGreeting } from "@eliware/elid-client";
console.log(createGreeting("Eli"));
```

Prerequisites: Node.js 26 and an ESM project with the package installed.
Command: node examples/basic.mjs.
Expected result: the command prints Hello, Eli!.
The package entrypoint is src/index.mjs; declarations are in index.d.ts. Check the npm registry to confirm the release or publication of version 9.0.0; package metadata does not confirm it.

## Development

Read AGENTS.md, docs/README.md, and specs/README.md before changing the package. Source modules live under src/ and tests mirror them under tests/. The current greeting API is inherited starter code, not an EliD client implementation. Define and implement the public client API before release consideration.

## Testing

Run `npm test` for aggregate validation and coverage. Use `npm run lint`, `npm run audit`, `npm run format:check`, `npm run typecheck`, and `npm run pack` for the applicable focused checks. `npm run format` writes formatted files; `npm run format:check` is read-only.

## Troubleshooting

Use Node.js 26 and update tests, declarations, examples, and API documentation together when changing the public API.

## Security

The current sample API uses no credentials, environment variables, or network services. Do not add secrets or private machine-specific values to source, tests, examples, or package contents.

## API

The public entrypoint exports createGreeting(name?: string): string. It returns a greeting and uses world when the name is omitted.

## Packaging

The intentional package allowlist is src/, index.d.ts, README.md, docs/, examples/, specs/, LICENSE, and RELEASE_NOTES.md.

Validate packed contents with npm run pack; the shared pack check must pass and the packed files must match the allowlist before release consideration.

Public publication uses npm provenance and an exact version tag matching package.json after Ubuntu validation. Verify the exact version in the npm registry after an explicitly authorized publication handoff.

## Examples

The runnable example and its prerequisites are indexed in examples/README.md. Start with the basic example, which uses no credentials or external services.

## Support

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

Use the [Eliware Discord community](https://discord.gg/M6aTR9eTwN), [GitHub issues](https://github.com/eliware/elid-client/issues), or [eliware@eliware.org](mailto:eliware@eliware.org). Include the relevant API or example and a concise description of the issue when requesting help.

## License

MIT. See [LICENSE](LICENSE).

## Links

- [Eliware home](https://eliware.org)
- [Eliware GitHub organization](https://github.com/eliware)
- [Discord](https://discord.gg/M6aTR9eTwN)
- [GitHub repository](https://github.com/eliware/elid-client) (`git+https://github.com/eliware/elid-client.git`)
- [npm package](https://www.npmjs.com/package/@eliware/elid-client)
- [Documentation](docs/README.md)
- [Specifications](specs/README.md)
- [Canonical repository profile specifications](https://github.com/eliware/test/blob/main/specs/conventions/README.md)
- [Runnable examples](examples/README.md)
- [Release notes](RELEASE_NOTES.md)
