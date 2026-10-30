# AGENTS.md

## Project

Repository: `eliware/elid-client`. Purpose: provide a Node.js server-side OAuth and OpenID Connect client for EliD applications.

## Scope and boundaries

Keep repository requirements in `specs/directives.yaml`.

## Layout

Use `README.md` and `specs/README.md` to find maintained files.

## Development

Give each source and test module one cohesive purpose.

## Validation

Use Node.js 26 or later and native ESM.

- Run `npm ci` after dependency changes.
- Run `npm test` for aggregate validation.
- Run `npm run lint` for lint checks.
- Run `npm run audit` for dependency checks.
- Run `npm run format` only when you intend to format files.
- Run `npm run format:check` to check formatting.
- Run `npm run typecheck` to check the TypeScript declaration.
- Run `npm run pack` to check package contents.

## Security

Keep credentials, tokens, private data, and runtime state out of Git.

## Changes

Keep each document in the repository that owns its content. Update its nearest index when you add a document.

## Library

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## npm publication

Run `npm run pack` before release consideration. Publish only through the approved Operations release handoff.
