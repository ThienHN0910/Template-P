# Command reference

This is the current v2 interface implemented by `@thienhn/create-template`.

```text
npx @thienhn/create-template [project-name] [options]
```

`project-name` is optional. When it is omitted, the CLI uses `my-p-app` as the initial interactive default. Project names must satisfy npm package-name rules, and the destination directory must not already exist.

| Option | Values | Current v2 behavior |
| --- | --- | --- |
| `-b, --backend <type>` | `dotnet`, `node`, `fastapi` | Selects the backend family. |
| `-a, --arch <architecture>` | `webapi-ddd`, `webapi-mvc`, `express-ddd`, `fastify-clean`, `modular`, `blank` | Selects the backend architecture. Validity depends on the backend. |
| `-f, --frontend <type>` | `vue3`, `react`, `nextjs`, `nuxt3` | Selects the frontend family. |
| `-d, --database <type>` | `postgres`, `mysql`, `sqlite`, `none` | Selects the database. |
| `--db <type>` | `postgres`, `mysql`, `sqlite`, `none` | Alias for `--database`. |
| `-p, --package-manager <pm>` | `pnpm`, `npm`, `bun` | Selects the generated JavaScript workspace package manager. |
| `--pm <pm>` | `pnpm`, `npm`, `bun` | Shorthand for `--package-manager`. |
| `--offline` | none | Uses vendored blueprints and skips remote generator downloads. |
| `--no-ai` | none | Skips AI skill and MCP setup. |
| `-y, --yes` | none | Uses defaults and skips the interactive questionnaire. |

## Defaults with `--yes`

Unspecified values currently default to pnpm, .NET 8 with `webapi-ddd`, PostgreSQL, and Vue. The default frontend feature selection includes TypeScript, router support, Pinia state management, ESLint, Prettier, Vitest, dark mode, SCSS, and i18n.

## Examples

```bash
npx @thienhn/create-template my-app --backend node --arch blank --frontend react --database none --package-manager npm --yes
```

```bash
npx @thienhn/create-template my-app --offline --no-ai --yes
```

Selectable options are not equivalent to production verification. Review the [current v2 compatibility contract](compatibility.md).
