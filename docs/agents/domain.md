# Domain documentation

This page explains how engineering skills should use the repository's domain documentation while exploring the codebase.

## Read before exploring

- Read **`CONTEXT.md`** at the repository root; or
- Read **`CONTEXT-MAP.md`** at the repository root when it exists. It identifies one `CONTEXT.md` file per context; read each context relevant to the work.
- Read relevant records in **`docs/adr/`**. In a multi-context repository, also inspect `src/<context>/docs/adr/` for context-scoped decisions.

If any of these paths does not exist, proceed silently. Do not flag the absence or propose creating a document before a term or decision genuinely requires one. The `/domain-modeling` skill creates domain documentation lazily.

## File structure

For this single-context repository:

```text
/
├── CONTEXT.md
├── docs/adr/
│   └── 0001-universal-template-architecture.md
└── packages/
```

## Use glossary vocabulary

When naming a domain concept in an issue title, refactor proposal, hypothesis, or test name, use the term defined in `CONTEXT.md`. Do not drift to a synonym that the glossary explicitly avoids.

If a needed concept is absent from the glossary, either the work is inventing language the project does not use, or the glossary has a real gap. Reconsider the former and record the latter for `/domain-modeling`.

## Flag ADR conflicts

If a proposal contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it. The three historical v1/v2 ADRs are superseded; new implementation work follows the approved v3 design specification.
