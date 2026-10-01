# AGENTS.md

## Project

Repository: `eliware/elid-client`. Purpose: maintain `@eliware/elid-client`, a Node.js 26 client library for EliD using native ESM.

## Scope and boundaries

Repository-wide scope: these instructions apply throughout `eliware/elid-client`; nearer `AGENTS.md` files govern their subdirectories. Important boundaries: this repository owns the client implementation, tests, metadata, and documentation. It excludes ownership of shared requirements, documentation policy, and release procedures. Shared repository requirements are maintained by `eliware/test`, documentation indexes maintained by `eliware/docs`, and release procedures by `eliware/operations`.

## Layout

The required repository structure includes `src/` implementation modules mirrored by `tests/`, public API files `src/index.mjs` and `index.d.ts`, `docs/`, `specs/`, and runnable `examples/`. The package contents are limited by this allowlist: `src/`, `index.d.ts`, `README.md`, `docs/`, `examples/`, `specs/`, `LICENSE`, and `RELEASE_NOTES.md`.

## Development

Read this file, `README.md`, and applicable documentation and specifications before changing files. Repository-wide development instructions apply to all source and test subdirectories; nearer `AGENTS.md` files apply only in their subdirectories. Every source and test module must have a single responsibility: one cohesive purpose and one reason to change. Business-logic modules and coordinators are both valid, including coordinators of coordinators, when each module does only its own responsibility. When a change introduces a distinct responsibility, create a focused submodule with a mirrored test and wire it through its owner; do not add the new responsibility to an existing module. During ordinary review, do not ignore mixed responsibilities you notice; refactor them as part of the change. The enforced maxima of 100 source lines and 200 test lines are separate blocking limits: passing them does not prove cohesion or permit mixed responsibilities below those limits. Keep `src/` and `tests/` exactly mirrored. This guidance is actionable, current, and concise; project-specific guidance supplements shared requirements without weakening them.

## Validation

Use Node.js 26, native ESM `.mjs` modules, and npm. The library has no runtime environment settings or configuration files; runtime behavior is controlled by API options. Run `npm ci` after dependency changes and `npm test` for aggregate validation and coverage. Use `npm run lint`, `npm run audit`, `npm run format:check`, `npm run typecheck`, and `npm run pack` for focused validation. `npm run format` writes files; use `npm run format:check` for read-only formatting validation.

## Security

Protect credentials, tokens, and private data. Never commit secret values or machine-specific runtime state. Keep real credentials out of source, tests, examples, and documentation; use only safe placeholders in `.env.example`.

## Changes

Preserve the documented public contract and update its specifications, tests, declarations, documentation, examples, and release notes when applicable. Record only approved deviations. Publication requires explicit authorization through the applicable Operations release handoff; this file does not authorize publishing.

## Library

The public runtime entrypoint is `@eliware/elid-client`, implemented by `src/index.mjs`; public declarations are in `index.d.ts`. Keep exports and declarations synchronized and test the public API. Compatibility guidance is provided in the README and release notes. Packaging limits package contents to the documented allowlist. Validate types with `npm run typecheck`, behavior and coverage with `npm test`, and consumer package contents with `eliware-test --pack` or `npm run pack` before release consideration.

## npm publication

The package identity is `@eliware/elid-client`; `package.json.version` is the version source and `RELEASE_NOTES.md` records user-visible changes. The exact package contents allowlist is `src/`, `index.d.ts`, `README.md`, `docs/`, `examples/`, `specs/`, `LICENSE`, and `RELEASE_NOTES.md`. The pack validation command is `eliware-test --pack` (also available as `npm run pack`); it must pass and verify the packed files against that allowlist. Publication uses npm provenance and an exact `vMAJOR.MINOR.PATCH` tag matching `package.json`, after Ubuntu validation. After authorized publication, verify that the exact version is available in the public registry. Publication requires explicit authorization through the Operations release handoff; these instructions do not authorize publishing.
