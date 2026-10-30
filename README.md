# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/elid-client [![npm](https://img.shields.io/npm/v/@eliware/elid-client)](https://www.npmjs.com/package/@eliware/elid-client) [![License](https://img.shields.io/github/license/eliware/elid-client)](https://github.com/eliware/elid-client/blob/main/LICENSE) [![CI](https://github.com/eliware/elid-client/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/elid-client/actions/workflows/ci.yaml)

Node.js server-side OAuth and OpenID Connect client for EliD applications.

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
- [Links](#links)
- [License](#license)

## Features

Use shared issuer discovery, Authorization Code with PKCE, ID Token verification, UserInfo, token refresh, and token revocation.

## Requirements

Use Node.js 26 or later.

## Setup

Install `@eliware/elid-client` with `npm install @eliware/elid-client`. Follow the [usage guide](docs/usage.md) to configure a client.

## Usage

Store authorization transactions and tokens in server-side application state. Read the [documentation index](docs/README.md), [usage guide](docs/usage.md), [API reference](docs/api.md), and [release notes](RELEASE_NOTES.md).

## Development

See [AGENTS.md](AGENTS.md) and the [specifications index](specs/README.md) for repository instructions.

## Testing

Run `npm test` for aggregate validation.

## Troubleshooting

Read the [API error guide](docs/api.md#errors) and [usage guide](docs/usage.md).

## Security

Keep client secrets and tokens on the server. Do not log credentials, authorization codes, tokens, or verifiers.

## API

Import `createEliDClient` and `ElidClientError` from the package root. Read the [API reference](docs/api.md).

## Packaging

Install a published version from npm. The package uses native ESM and includes TypeScript declarations.

## Examples

Follow the [example guide](examples/README.md) to run the discovery example.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/elid-client)
- [Bug Reports](https://github.com/eliware/elid-client/issues)
- [npm](https://www.npmjs.com/package/@eliware/elid-client)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

[MIT © Eliware](LICENSE)
