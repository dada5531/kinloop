# Contributing to KINLOOP

## Branch Strategy

- **`main`** — Production branch. Protected; requires PR review before merge.
- **`develop`** — Working branch. All feature branches merge here first.
- **Feature branches** — Named `feature/<issue-number>-<short-description>` (e.g., `feature/5-scheduler-extraction`).
- **Bug fix branches** — Named `fix/<issue-number>-<short-description>`.

### Workflow

1. Create a feature branch from `develop`
2. Implement the feature, commit with conventional commits
3. Open a PR to `develop`
4. After review and CI passes, merge to `develop`
5. Periodically, `develop` is merged to `main` for releases

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring, no behavior change |
| `test` | Adding or updating tests |
| `chore` | Build, CI, dependency updates |

### Scopes

Use the quadrant name or system area: `scheduler`, `development`, `play`, `coach`, `dashboard`, `auth`, `db`, `ci`.

### Examples

```
feat(scheduler): add Claude extraction for permission slips
fix(coach): handle empty RAG results gracefully
docs(claude): update prompt engineering notes
test(scheduler): add fixture for multi-event email
chore(deps): bump @anthropic-ai/sdk to 0.25.0
```

## Pull Request Process

1. Fill out the PR template completely
2. Ensure CI passes (lint + typecheck + tests)
3. Request review from at least one team member
4. Update `CLAUDE.md` or `/docs/` if the change affects conventions or architecture
5. Squash merge to keep history clean

## Code Style

- TypeScript strict mode — no `any` types
- Prettier for formatting (runs on pre-commit via Husky)
- ESLint for linting
- Server Components by default; `"use client"` only when needed
- Zod schemas for all Claude structured outputs
- Prompts in `/prompts/` as markdown — never inline

## Testing

- Every Claude extractor needs a unit test with a fixture input
- Mock the Anthropic API in tests — do not make real API calls
- E2E tests cover critical user flows
- Run `pnpm test` before pushing
