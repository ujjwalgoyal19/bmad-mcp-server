# Contributing to BMAD-MCP

Thank you for your interest in contributing to BMAD-MCP! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

Prerequisites: Node.js >= 18 and npm >= 8

1. Clone the repository:

```bash
git clone <REPO_URL>
cd bmad-mcp
```

2. Create a branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

3. Install dependencies:

```bash
npm install
```

4. Build the project:

```bash
npm run build
```

5. Run tests:

```bash
npm run test
```

6. Run the demo locally (quick check):

```bash
npm run dev:demo
```

## Development Workflow

### Branch Naming

Use descriptive branch names that reflect the changes you're making:

- `feature/your-feature-name` for new features
- `fix/issue-description` for bug fixes
- `docs/what-you-documented` for documentation changes
- `refactor/what-you-refactored` for code refactoring

### Commit Messages

Write clear and descriptive commit messages that explain the purpose of your changes. Follow the conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Where `type` is one of:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that don't affect the meaning of the code (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

### Pull Requests

1. Update your fork to the latest version of the main repository
2. Create a new branch for your changes
3. Make your changes and commit them
4. Push your branch to your fork
5. Create a pull request from your branch to the main repository

In your pull request description, explain the changes you've made and why they're necessary.

## Code Style

This project uses TypeScript and follows a consistent code style. Please ensure your code adheres to the following guidelines:

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons at the end of statements
- Use explicit types where necessary
- Follow the existing code style in the project

## Testing

All new features and bug fixes should include tests. This project uses Vitest for testing.

To run tests:

```bash
npm run test
```

To run tests in watch mode during development:

```bash
npm run test:watch
```

## Documentation

Please update the documentation when making changes to the codebase. This includes:

- Code comments
- README and other markdown files
- API documentation
- Examples

## Monorepo Structure

This project is organized as a monorepo with multiple packages. When making changes, consider which package(s) should be modified and ensure that your changes are consistent across the codebase.

## Release Process

The release process is managed by the project maintainers. If you're a maintainer, follow these steps to create a new release:

1. Update the version number in the relevant package.json files
2. Update the CHANGELOG.md file with the changes in the new version
3. Commit the version bump and changelog update
4. Create a new tag for the version
5. Push the tag to the repository
6. Create a new release on GitHub

## Getting Help

If you have questions or need help with contributing, please:

- Open an issue on GitHub
- Reach out to the project maintainers

Thank you for contributing to BMAD-MCP!
