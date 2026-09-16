# Installation

`@thienhn/create-template` is the primary distribution for Template-P v2. It requires Node.js 22.13 or later.

Run it directly with npm's package runner:

```bash
npx @thienhn/create-template my-app
```

You can also omit the project name and supply it in the interactive flow:

```bash
npx @thienhn/create-template
```

The command creates a new target directory, so choose a name for a directory that does not already exist. The CLI source repository is an engine repository; do not copy it through GitHub's **Use this template** button to start an application.

## After scaffolding

The generated workspace prints its next steps. In general, enter the new directory, install dependencies with the selected package manager, start a selected local database if applicable, and use the generated workspace scripts.

## Runtime prerequisites

The interactive flow checks the runtime required by the selected backend (.NET, Node.js, or Python) and offers guidance if it is missing. Installing runtimes can require operating-system privileges; inspect and approve those operations in your environment.

For a deterministic, network-limited invocation, continue with the [automation guide](automation.md).
