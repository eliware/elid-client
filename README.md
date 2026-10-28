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

Build server-side EliD integrations with shared OAuth and OpenID Connect operations. Use OAuth-only scopes for API access without user sign-in. Include `openid` for OpenID Connect sign-in. The library supports issuer discovery, Authorization Code with PKCE, ID Token verification, UserInfo, token refresh, and token revocation. Keep application sessions, cookies, routes, and storage in the consuming application.

## Requirements

Use Node.js 26 or later.

## Setup

Install `@eliware/elid-client` in a Node.js server application. Read [setup guidance](docs/usage.md) for configuration instructions.

## Usage

Create one client instance for each EliD application. Store each authorization transaction in the application session store and consume it once during callback handling. Read the [user guide](docs/README.md) and [release notes](RELEASE_NOTES.md).

## Development

Read [AGENTS.md](AGENTS.md) and the [specifications index](specs/README.md) before you change files.

## Testing

Run `npm test` for repository checks. Run `npm run typecheck` to validate the TypeScript declaration.

## Troubleshooting

Read the [usage guide](docs/usage.md) for installation, configuration, and client operation guidance.

## Security

Keep client secrets and server-held tokens on the server. Do not log credentials, authorization codes, tokens, or verifiers.

## API

See the [API reference](docs/api.md) for client creation, authorization, token handling, and typed errors.

## Packaging

Run `npm run pack` to check package contents. Follow approved release steps before publication.

## Examples

See [example guidance](examples/README.md) for prerequisites, commands, and expected output.

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
