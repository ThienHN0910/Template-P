# Release process

1. Update `CHANGELOG.md` and the package version.
2. Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
3. Verify the npm artifact with `npm pack --dry-run` from `packages/cli`.
4. Create a GitHub Release from the reviewed commit.

## npm trusted publishing

The publish workflow requests an OIDC identity and runs `npm publish --provenance`. Before
the next release, configure npm Trusted Publishing for `@thienhn/create-template` to trust
the `Publish Package` workflow in `ThienHN0910/Template-P`. This removes the need for a
long-lived `NPM_TOKEN` and makes package provenance verifiable.

Until that npm-side configuration is complete, do not trigger the publish workflow. The
required npm configuration is an external maintainer action, not a repository secret.
