# Automation

Use non-interactive flags to scaffold v2 projects in scripts or CI. `--yes` skips prompts and currently selects the v2 defaults for any choices you do not specify:

- package manager: pnpm
- backend: .NET 8 with `webapi-ddd`
- database: PostgreSQL
- frontend: Vue

For example, this complete command uses bundled blueprints and does not download upstream generators or dynamic skills:

```bash
npx @thienhn/create-template my-app \
  --backend dotnet \
  --arch webapi-ddd \
  --frontend vue3 \
  --database postgres \
  --package-manager pnpm \
  --offline \
  --no-ai \
  --yes
```

`--offline` selects vendored blueprints and skips remote generator downloads. `--no-ai` skips AI skills and MCP setup. Together they avoid both upstream-generator and dynamic-skill downloads.

The v2 CLI accepts only supported selections and rejects invalid combinations before writing the target project. Consult the [command reference](../reference/commands.md) for the complete flag syntax and the [compatibility contract](../reference/compatibility.md) before treating a combination as production-verified.
