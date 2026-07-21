# terminal-typing

https://terminal-typing.pages.dev/

A browser-based practice environment for learning shell commands and keyboard workflows.

terminal-typing includes focused lessons and individual challenges for PowerShell, Bash, and Zsh. Commands run against authored scenarios and isolated in-memory workspaces, so the application never executes commands or accesses the learner's real filesystem.

## Features

- PowerShell, Bash, and Zsh starter lessons
- Individual command challenges and randomized lesson runs
- Keyboard-first, accessible terminal practice
- Progress stored locally in the learner's browser
- Static application with no login, backend, or application telemetry

## Development

Node.js 22 and npm are recommended.

```sh
npm install
npm run dev
```

Before submitting a change, run the same verification used for production deployments:

```sh
npm run check
```

The individual commands remain available as `npm test`, `npm run lint`, and `npm run build`. Production assets are written to `dist`.

## Deployment

The application is designed for Cloudflare Pages using its GitHub integration. The Pages project uses:

- Production branch: `main`
- Build system: v3 with Node.js 22
- Build command: `npm run check`
- Build output directory: `dist`
- Root directory: the repository root
- Preview deployments for non-production branches
- Cloudflare Web Analytics disabled

Merges to `main` deploy automatically after tests, lint, type checking, and the production build pass. Other branches receive preview deployments.

## Architecture

Important architecture decisions are recorded in [`docs/adr`](docs/adr), and the project's domain language is defined in [`CONTEXT.md`](CONTEXT.md).

The application follows these core constraints:

- Shell behavior is scenario-driven rather than a complete emulator.
- File interactions use Virtual Workspaces and never access a learner's real files.
- Curriculum ships with the static client and Learning Progress stays in browser storage.
- The frontend sends no learner activity or client-error telemetry.
