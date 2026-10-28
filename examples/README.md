# Examples

The [discovery example](discover.mjs) shows how to load validated issuer metadata.

## Prerequisites

Install `@eliware/elid-client` in a Node.js 26 or later server application. Set `ELID_ISSUER_URL`, `ELID_CLIENT_ID`, `ELID_REDIRECT_URI`, and `ELID_SCOPES`.

## Command

Run `node node_modules/@eliware/elid-client/examples/discover.mjs` from the application directory.

## Expected result

The example prints the validated issuer and discovered endpoint URLs.
