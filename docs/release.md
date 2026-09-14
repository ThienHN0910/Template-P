# Release process

1. Update `CHANGELOG.md` and the package version.
2. Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
3. Verify the npm artifact with `npm pack --dry-run` from `packages/cli`.
4. If npm Trusted Publishing is configured, create a GitHub Release from the reviewed commit;
   the release workflow publishes the package.

For a manual release before Trusted Publishing is configured, run `npm login --auth-type=web`
and `npm publish --access public` from `packages/cli` on the reviewed `main` commit. Tag
that commit with the package version. Do not create a GitHub Release for the same version:
its `published` event would trigger the workflow and attempt to publish that version again.

## npm trusted publishing

The publish workflow requests an OIDC identity and runs `npm publish --provenance`. Before
the next release, configure npm Trusted Publishing for `@thienhn/create-template` to trust
the `Publish Package` workflow in `ThienHN0910/Template-P`. This removes the need for a
long-lived `NPM_TOKEN` and makes package provenance verifiable.

Until that npm-side configuration is complete, do not trigger the publish workflow. The
required npm configuration is an external maintainer action, not a repository secret.
