# GitHub maintenance

This document records the approved GitHub configuration for Template-P and the commands used to maintain it. Preserve repository identity and the five canonical triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`.

## Desired repository state

| Setting | Value |
| --- | --- |
| Repository name | Template-P |
| Description | CLI-first full-stack scaffolder for verified .NET, Node.js, FastAPI, Vue, React, Next.js, and Nuxt project stacks. |
| Homepage | https://www.npmjs.com/package/@thienhn/create-template |
| Issues | enabled |
| Discussions | enabled |
| Wiki | disabled |
| Template repository | disabled |
| Delete merged branches | enabled |

## Topics

```text
cli, scaffolder, fullstack, dotnet, nodejs, fastapi, react, vue, nextjs, nuxt,
postgresql, sql-server, mysql, mongodb, openapi, typescript, template, developer-tools
```

## Administration commands

Inspect the state before changing it:

```shell
gh repo view --json nameWithOwner,description,homepageUrl,isTemplate,hasIssuesEnabled,hasDiscussionsEnabled,hasWikiEnabled,deleteBranchOnMerge,repositoryTopics
gh label list --limit 100
gh api "repos/ThienHN0910/Template-P/milestones?state=all"
```

Apply the approved settings and exact topic set:

```shell
gh api --method PATCH repos/ThienHN0910/Template-P -f description='CLI-first full-stack scaffolder for verified .NET, Node.js, FastAPI, Vue, React, Next.js, and Nuxt project stacks.' -f homepage='https://www.npmjs.com/package/@thienhn/create-template' -F has_issues=true -F has_discussions=true -F has_wiki=false -F is_template=false -F delete_branch_on_merge=true
gh api --method PUT repos/ThienHN0910/Template-P/topics -f 'names[]=cli' -f 'names[]=scaffolder' -f 'names[]=fullstack' -f 'names[]=dotnet' -f 'names[]=nodejs' -f 'names[]=fastapi' -f 'names[]=react' -f 'names[]=vue' -f 'names[]=nextjs' -f 'names[]=nuxt' -f 'names[]=postgresql' -f 'names[]=sql-server' -f 'names[]=mysql' -f 'names[]=mongodb' -f 'names[]=openapi' -f 'names[]=typescript' -f 'names[]=template' -f 'names[]=developer-tools'
```

Create a milestone only when its exact title is absent from the all-state milestone listing:

```shell
gh api --method POST repos/ThienHN0910/Template-P/milestones -f title='v3.0' -f description='Capability registry, verified database adapters, production baseline, OpenAPI contract, manifest, and core CLI lifecycle.'
gh api --method POST repos/ThienHN0910/Template-P/milestones -f title='v3.1' -f description='Add command plus OIDC, Redis, OpenTelemetry, caching, and background-job capabilities.'
gh api --method POST repos/ThienHN0910/Template-P/milestones -f title='v3.2' -f description='Managed diffs, conservative upgrades, codemods, and project migrations.'
gh api --method POST repos/ThienHN0910/Template-P/milestones -f title='v3.3' -f description='Preview plugin SDK and explicit community capability trust model.'
```

Verify the final state:

```shell
gh repo view --json nameWithOwner,description,homepageUrl,isTemplate,hasIssuesEnabled,hasDiscussionsEnabled,hasWikiEnabled,deleteBranchOnMerge,repositoryTopics
gh api "repos/ThienHN0910/Template-P/milestones?state=open"
```
