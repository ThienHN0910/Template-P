# Release process

1. Update `CHANGELOG.md` and the package version.
2. Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
3. Verify the npm artifact with `npm pack --dry-run` from `packages/cli`.
4. Create and push an annotated `vX.Y.Z` tag on the reviewed `main` commit, then create a
   GitHub Release from that tag. The release workflow publishes through npm Trusted Publishing.
5. Verify the workflow passed, the new version is npm's `latest`, and the package has a
   provenance attestation.

If the automated workflow is unavailable, a maintainer can run `npm login --auth-type=web`
and `npm publish --access public` from `packages/cli` on the reviewed `main` commit. Do not
create a GitHub Release for the same version while its `published` event still triggers the
workflow, or it will attempt to publish that version again.

## npm trusted publishing

The npm Trusted Publisher for `@thienhn/create-template` trusts `publish.yml` in
`ThienHN0910/Template-P` with direct publish permission. The workflow requests an OIDC
identity and runs `npm publish --provenance`; [v2.0.1](https://github.com/ThienHN0910/Template-P/releases/tag/v2.0.1)
was published through this path with provenance. No long-lived `NPM_TOKEN` is required.

If the npm-side configuration must be recreated, use npm 11 (npm may request browser-based 2FA):

```bash
npx npm@11.19.1 trust github @thienhn/create-template --repo ThienHN0910/Template-P --file publish.yml --allow-publish
```

The matching workflow uses Node.js 24, npm 11.19.1, and `id-token: write`. Confirm the
publisher with `npx npm@11.19.1 trust list @thienhn/create-template` before creating a release.
