# AGENTS.md

## Project

Repository: `eliware/elid-client`. Purpose: provide shared Node.js OAuth and OpenID Connect operations for EliD applications.

## Scope and boundaries

Keep repository-specific requirements in `specs/directives.yaml`. Keep shared requirements in `eliware/test`, documentation indexes in `eliware/docs`, and release procedures in `eliware/operations`.

## Layout

Keep implementation modules under `src/` and mirror them under `tests/`. Keep public declarations in `src/index.d.ts`, documentation in `docs/`, requirements in `specs/`, and runnable examples in `examples/`.

## Development

Give each source and test module one cohesive purpose. Create a focused module and mirrored test when a change adds a distinct responsibility.

## Validation

Use Node.js 26 or later, native ESM, and npm.

- Run `npm ci` after dependency changes.
- Run `npm test` for aggregate validation.
- Run `npm run lint` for lint checks.
- Run `npm run audit` for dependency checks.
- Run `npm run format:check` to check formatting.
- Run `npm run typecheck` to check the TypeScript declaration.
- Run `npm run pack` to check package contents.
- Run `npm run format` only when you intend to write formatting changes.

## Security

Keep credentials, tokens, and private data out of Git. Keep machine-specific runtime state out of source, tests, examples, and documentation.

## Changes

Update specifications, tests, declarations, documentation, examples, and release notes when a change affects them. Update the nearest index when you add a document.

## Library

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## npm publication

Use `package.json` as the package version source and `RELEASE_NOTES.md` for user-visible changes. Run `npm run pack` before release consideration. Publish only through the approved Operations release handoff.
