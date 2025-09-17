# CONTRIBUTING

Thanks for contributing! Please follow these guidelines to keep the project healthy and reviewable.

## Workflow

1. Fork the repo and create a feature branch.
2. Run tests and linters locally (see `DEVELOPER_GUIDE.md`).
3. Open a PR with a clear description and link to relevant issues.

## PR checklist

- Include small, focused changes per PR.
- Add tests for new behavior and update types where needed.
- Run `bunx turbo run lint` and `bunx turbo run typecheck` before requesting review.

## Commit messages

- Use a short summary and an optional scope, e.g. `mcp-core: validate inputs in saveTextResource`.
