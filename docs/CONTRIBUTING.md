# Contributing to RootlessNet

We welcome contributions! This document outlines how to participate.

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- No harassment or discrimination
- Assume good intentions

---

## How to Contribute

### 1. Reporting Issues

- Check existing issues first
- Use issue templates
- Include reproduction steps
- Provide system information

### 2. Feature Requests

- Discuss in GitHub Discussions first
- Explain use case clearly
- Consider protocol implications
- Be open to alternatives

### 3. Pull Requests

#### Setup

```bash
git clone <repository-url>
cd protocol
```

#### Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes
4. Run tests: `bun test`
5. Run linter: `bun lint`
6. Commit with conventional commits
7. Push and create PR

#### Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 4. Documentation

- Keep docs up to date
- Use clear language
- Include examples
- Follow markdown style guide

---

## Architecture Decisions

Major changes require an RFC:

1. Create issue with RFC template
2. Discuss with maintainers
3. Implement after approval

---

## Release Process

1. Changelog updated
2. Version bumped
3. Tests pass
4. Security review (if applicable)
5. Maintainer approval
6. Tag and publish

---

## Recognition

Contributors are listed in AUTHORS.md.

---

*Thank you for contributing to RootlessNet!*
