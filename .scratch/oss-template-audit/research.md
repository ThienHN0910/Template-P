# Nghiên cứu: baseline OSS cho `create-p-stack` / Template-P

Ngày khảo sát: 2026-09-14
Phạm vi: đọc tĩnh working tree hiện tại; không kiểm tra GitHub repository settings, npm registry, secrets hay chạy generator trên mạng. “Thiếu” dưới đây nghĩa là không thấy trong tree/config đã đọc, không kết luận về các thiết lập trên giao diện GitHub.

## Kết luận ngắn

Template-P đã có một nền tảng sản phẩm đáng kể: CLI TypeScript đóng gói template, chế độ non-interactive, backend/frontend/database matrix, health endpoint, `.env.example`, Docker healthcheck, MIT license, README, CONTRIBUTING, Code of Conduct, issue forms, PR template và CI build/`npm pack --dry-run`.

Tuy nhiên, nó **chưa sẵn sàng để hứa hẹn “production-grade / universal” một cách đáng tin cậy**. Rủi ro lớn nhất không phải thiếu thêm framework, mà là không có contract test cho từng tổ hợp sinh mã, upstream `@latest` và skill install biến đổi theo thời gian, và luồng publish chưa có provenance/trusted publishing. Khi một template hỗ trợ nhiều stack, giá trị tái sử dụng chỉ có khi từng lựa chọn được kiểm chứng như một product surface độc lập.

Khuyến nghị chiến lược: trước hết thu hẹp thành một **compatibility contract có phiên bản**, kiểm thử các “golden scaffold” đại diện, rồi mới mở rộng framework/AI bundle. Không nên thêm Go/Rust/Svelte hay nhiều tính năng mặc định trước khi có vòng lặp này.

## Baseline hiện đại từ nguồn chính thức

| Baseline | Nguồn primary/official | Ý nghĩa cho CLI/template |
| --- | --- | --- |
| Community health | [GitHub Community Profile](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories) kiểm tra README, LICENSE, CONTRIBUTING, Code of Conduct; đồng thời chỉ rõ SECURITY policy và issue templates hợp lệ. | OSS cần một đường vào rõ ràng cho user, contributor và người báo lỗ hổng—không chỉ badges/README. |
| Workflow hardening | [GitHub Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use) nêu nguyên tắc least privilege và nói full commit SHA là cách duy nhất để action reference là immutable. | Workflow build/release cần `permissions` tối thiểu, action pin SHA (kèm comment version), và bảo vệ file workflow/release. |
| Dependency maintenance | [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) yêu cầu `version: 2`, `updates`, ecosystem, directory, schedule; hỗ trợ npm, NuGet, pip, Docker, GitHub Actions và nhóm update. | Đây là lựa chọn built-in phù hợp với repo đa hệ sinh thái; cần theo dõi cả dependencies của CLI lẫn Action refs, và sau này các manifest template. |
| Chặn dependency nguy hiểm trước merge | [GitHub Dependency Review](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/customize-dependency-review-action) có thể fail PR khi thêm dependency có known vulnerability và, nếu required, chặn merge. | Hữu ích vì scaffold chạy code tải qua `npx` và phân phối template cho nhiều người dùng. |
| Code/security scan | [GitHub CodeQL](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning) là engine GitHub cho automated security checks; public repositories đủ điều kiện có thể dùng default setup khi Actions được bật. | Nên bật CodeQL/default setup cho TypeScript/JavaScript; đây là lớp phòng vệ bổ sung, không thay thế tests. |
| npm artifact boundary | [`npm pack`](https://docs.npmjs.com/cli/v11/commands/npm-pack/) tạo tarball như lúc publish; [`files` trong package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#files) là allow-list cho artifact. | `npm pack --dry-run` là smoke check tốt, nhưng phải assert nội dung, executable bins và chạy được package từ tarball. |
| npm provenance / trusted publishing | [npm provenance](https://docs.npmjs.com/generating-provenance-statements/) liên kết package với source/build; GitHub Actions cần `id-token: write` và `npm publish --provenance`. [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) dùng OIDC, loại bỏ long-lived publish token, tự tạo provenance; npm khuyến nghị ưu tiên nó. | Publish release phải là build/test đã kiểm chứng từ CI, có identity/provenance kiểm tra được, thay vì dựa vào `NPM_TOKEN` lâu dài. |

## Đối chiếu codebase

### Những phần đã đạt nền tốt

- Community: root có `README.md`, `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`; `.github/ISSUE_TEMPLATE/*.yml` và `PULL_REQUEST_TEMPLATE.md` tồn tại. Issue forms có `name`/`description`, đúng điều kiện nhận checkmark trên Community Profile.
- Package: `packages/cli/package.json` khai báo `bin`, `files`, repository/homepage/bugs, license và `prepublishOnly`; CI đã build rồi dùng `npm pack --dry-run`. Đây là khởi đầu đúng cho package boundary.
- Product surface: CLI có interactive + `--yes` flags; có fallback cho frontend và Matt Pocock skills; có `pnpm-lock.yaml`; backend mẫu có `/api/health`; generator tạo `.env.example`, `.gitignore`, Docker Compose và khởi tạo git repository.
- CI: `.github/workflows/ci.yml` chạy trên `push`/`pull_request` tới `main`, cài dependencies và build. Đây là dấu hiệu tốt nhưng hiện chỉ validate chính CLI bundle.

### Gap P0 — cần xử lý trước khi quảng bá production/universal

1. **Không có test suite hay scaffold contract matrix.** Root/package CLI không có `test`, `lint`, `typecheck` scripts; CI chỉ build + `npm pack --dry-run`. Không thấy test/spec runner. Hệ quả là không có bằng chứng rằng các tổ hợp backend × frontend × database × package manager scaffold thành dự án cài/build/chạy được.

   Đặc biệt, `scaffoldHybridFrontend()` gọi `create-vue@latest`/`create-next-app@latest`, và `installDynamicSkills()` gọi `skills@latest`; mỗi upstream update có thể làm output hoặc flags thay đổi. Fallback chỉ được dùng khi upstream fail nên không thay thế được compatibility test.

   **Nâng cấp đề xuất:** định nghĩa một manifest “supported combinations” (không phải Cartesian product ngầm); CI tạo thư mục tạm cho các golden combinations và assert:
   - CLI `--help`, invalid flags/name, cancel/error, non-interactive success;
   - layout + required files + `.env` không bị git tracking + JSON/YAML parse;
   - install và `build` đúng package manager/runtime cho từng combination;
   - health check end-to-end tối thiểu cho các backend, khi môi trường runner hỗ trợ;
   - `npm pack`, cài từ tarball trong empty temp dir và chạy bin.

   Chạy một nightly/canary job với upstream latest; release chỉ dùng version range đã xác nhận. Công khai compatibility matrix với version/OS/Node/.NET/Python thay vì ghi “latest”/“production-grade” chung chung.

2. **Nondeterminism và supply-chain exposure trong đường scaffold.** `npx create-*@latest`, `npx skills@latest`, skills từ GitHub tùy chọn, images `dpage/pgadmin4:latest`/`adminer:latest`, cùng nhiều dependency version range khiến cùng một lệnh có thể sinh output khác. CLI còn chạy tool cài đặt hệ thống và agent skill installer—đây là trust boundary lớn hơn một generator thuần file-copy.

   **Nâng cấp đề xuất:** tách rõ 2 channel:
   - `stable`: pinned/allowlisted generator + template + image versions đã qua matrix;
   - `latest`/`experimental`: opt-in, cảnh báo rằng output chưa nằm trong support contract.

   Pin image tag đến immutable digest cho generated Docker Compose; pin/allowlist skill sources (owner/repo + revision/manifest + checksum nếu tool hỗ trợ); hiển thị và ghi audit manifest (`.template-p/manifest.json`) gồm CLI version, template revision, upstream generator/package versions, option selections và timestamp. Không chạy auto-install hệ thống hoặc remote skill code mặc định ở `--yes`; yêu cầu explicit opt-in/flag và display exact command trước khi thực thi.

3. **Publish workflow chưa đạt chain-of-custody hiện đại.** `.github/workflows/publish.yml` dùng `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`, thiếu `id-token: write`, thiếu `--provenance`/trusted publisher; permissions còn `packages: write` dù publish là npm registry. Workflow không chạy tests (vì chưa có) và cài bằng `pnpm install --frozen-lockfile=false`. npm mô tả trusted publishing/OIDC là cách loại bỏ publish token lâu dài và tự tạo provenance; provenance cũng cần runner cloud, public matching repository và `id-token: write`.

   **Nâng cấp đề xuất:** chuyển package npm sang npm Trusted Publisher cho `publish.yml`, use minimal permissions `contents: read`, `id-token: write`, và publish sau `pnpm install --frozen-lockfile`, lint/typecheck/test/scaffold matrix/pack-install check thành công. Nếu chưa chuyển ngay, tối thiểu `npm publish --provenance --access public`, scope token vào một package, enforce npm 2FA và có rotation/revocation runbook.

4. **Đường dẫn output có thể vượt cwd và overwrite không transaction-safe.** `targetDir = path.resolve(process.cwd(), projectName)` được tạo cho mọi mode; non-interactive raw argument không qua validation. Vì vậy `..`, absolute path hoặc tên không đúng invariant npm có thể trở thành target. Interactive cũng cho tiếp tục với directory không rỗng rồi các bước `cp`/`writeFile` ghi đè từng phần. `installDynamicSkills()` còn xóa các “rogue” directory nếu xuất hiện trong target.

   **Nâng cấp đề xuất:** xác thực project slug duy nhất một nơi cho cả flags/prompts (lowercase npm-package-compatible), reject absolute/traversal, verify resolved target nằm trong intended parent, default fail nếu non-empty, và scaffold vào sibling staging dir rồi rename atomically khi tất cả checks thành công. Cleanup chỉ được phép trong staging dir. Thêm tests an toàn cho các trường hợp này.

### Gap P1 — làm repo dễ tin cậy và dễ đóng góp hơn

5. **OSS community profile chưa hoàn chỉnh.** Không thấy root `SECURITY.md`, `SUPPORT.md`, `.github/FUNDING.yml`, `CODEOWNERS`, release policy/changelog, hoặc `dependabot.yml`. GitHub Community Profile xem SECURITY policy là cách hướng dẫn reporting vulnerability. `CONTRIBUTING.md` nói build là đủ nhưng không có test/lint command, maintainer ownership/SLA hay quy trình release/compatibility deprecation.

   **Nâng cấp đề xuất:** thêm `SECURITY.md` (private disclosure channel, supported versions, response expectations), `SUPPORT.md` (Q&A/discussions vs bugs), `CODEOWNERS` cho `packages/cli`, `templates`, `.github/workflows`, `dependabot.yml` cho npm/GitHub Actions/Docker/NuGet/pip as applicable, CHANGELOG theo release, và docs `support-policy.md`/`compatibility.md`.

6. **Workflow security/reproducibility còn lỏng.** Cả workflow dùng mutable action tags (`actions/checkout@v4`, `setup-node@v4`, `pnpm/action-setup@v3`) thay vì full SHA, contrary to GitHub guidance for immutable action releases. CI có no explicit top-level `permissions`, dùng pnpm v9 nhưng root pins pnpm 11, và `--frozen-lockfile=false` cho phép lockfile drift ngay trong CI/release. Không thấy dependency review/CodeQL/security scanning automation.

   **Nâng cấp đề xuất:** pin action full SHA (comment tag/version for humans), set explicit job/workflow least privilege, synchronize Node/pnpm with declared `packageManager`/engines, use frozen install for verification/release, configure Dependabot and dependency review. Enable CodeQL/default setup in repo settings or add a reviewable workflow. Protect `main`/release tags with required CI and review.

7. **Template contract/documentation không nhất quán và vượt lời hứa.** README/package README/CLI naming không thống nhất (`create-p-stack`, `create-template`, command examples). Root says Node `>=18`, but CI Node 20 and the npm trusted publishing baseline currently has higher tool requirements. README hứa `pnpm dev` chạy cả backend/frontend, nhưng generated root build/dev scripts and generated package manifests need validation per backend/PM. Choice `--pm bun` vẫn generates pnpm-specific workspace only when pnpm, yet uses `<pm> --filter`, a contract cần test/document. Các architecture flags không được validate theo backend mà fallback silently sang default template.

   **Nâng cấp đề xuất:** publish a generated-output reference per supported stack; make invalid backend/architecture/PM combinations fail with a clear diagnostic; use one canonical public name/command and add docs CI snippets that execute them. Include a `--json` machine-readable output and `--dry-run`/plan mode to support CI, wrappers and debugging.

8. **Default generated projects thiếu delivery baseline.** Có health endpoint/.env/Docker local DB là hữu ích, nhưng không có bằng chứng generator emits CI, formatter/linter/typecheck/test commands, secret scan/dependency update config, container security guidance, migrations/seeding, runtime configuration contract, observability/logging/error handling, deployment/production profile, or accessibility/security baseline. Không phải mọi app cần tất cả, nên đừng hard-code một “enterprise” boilerplate.

   **Nâng cấp đề xuất:** introduce explicit preset layers, all opt-in and testable: `minimal`, `web-api`, `fullstack`, `production`. Production layer can add CI, health/readiness split, structured logs, request IDs, validation/error envelope, OpenAPI contract, migrations strategy, test seed, `.env.example` schema, Docker production guidance and security workflow. Keep domain/auth/payment/cloud integrations out of defaults; they are product decisions, not universal primitives.

### Gap P2 — chất lượng trải nghiệm và khả năng bảo trì

9. **Agent/MCP bundle should be an optional integration, not a core default.** Default non-interactive config selects multiple agents, remote skills and MCP. This expands install time, repo size, compatibility obligations and trust surface; `mcp.json` embeds default local DB credentials. Maintain a versioned integration catalog and license/provenance review for vendored skills; make no-agent/no-network a first-class default for CI and conservative users.

10. **No template lifecycle policy.** Templates evolve separately from upstream generators. Add template ownership, deprecation policy, automated age/dependency report, ADR for each new blueprint, and a “why this is supported” acceptance checklist. Track success telemetry only with explicit opt-in and a privacy statement—never silently collect project details.

## Recommended execution order

1. **P0 safety + truthfulness:** output-path containment/non-empty protection, flag validation, stop making unverified claims; add a canonical command/version/compatibility document.
2. **P0 verification:** test harness plus 4–6 representative golden scaffolds (one each .NET/Node/FastAPI and Vue/React/Next/Nuxt; DB/no-DB; pnpm/npm), then package-from-tarball test. Expand matrix only after tests are stable.
3. **P0 release integrity:** frozen CI, matching toolchain, npm OIDC/trusted publishing + provenance, protected releases.
4. **P1 OSS/security posture:** `SECURITY.md`, Dependabot, dependency review, CodeQL, SHA-pinned actions/least permissions and OWNERS.
5. **P1 product presets:** define scoped minimal/fullstack/production contracts, making expensive or opinionated systems selectable rather than mandatory.
6. **P2 expansion:** only add templates/integrations whose acceptance matrix, owner, docs and maintenance policy are committed at the same time.

## Decision framing: is it reusable enough?

**Today:** suitable as an ambitious accelerator/demo for a maintainer-controlled stack, especially when users inspect generated code.
**Not yet:** a generally reusable OSS foundation where arbitrary consumers can expect repeatable, supported production outputs.
**Gate to call it broadly reusable:** every advertised supported combination has a documented toolchain and an automated green scaffold → install → build → smoke path from both source and packed npm artifact; release provenance is verifiable; remote/privileged operations are explicit and controlled; and the supported scope is more precise than “every project.”

## Sources

All normative claims above are linked inline to first-party GitHub or npm documentation. Local observations cite file paths in this working tree and should be re-audited after implementation.
