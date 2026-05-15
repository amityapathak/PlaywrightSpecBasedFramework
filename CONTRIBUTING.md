# Contributing to AI Automation Framework

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites
- Node.js 18+ or compatible version
- npm
- OpenSpec CLI

### Setup for Development

```bash
git clone <repository-url>
cd ai-automation-framework
npm install
```

## Development Workflow

### 1. Creating Changes with OpenSpec

```bash
# Create a new change
openspec new change "<change-name>"

# Check status
openspec status --change "<change-name>"

# Follow artifact instructions
openspec instructions proposal --change "<change-name>"
```

### 2. Implementing Changes

1. Create the proposal
2. Create the design
3. Create the specifications
4. Create the task list
5. Implement the code
6. Generate and verify tests

### 3. Testing

```bash
# Generate tests from specs
npm run generate-tests

# Run all tests
npm test

# Run generated tests only
npm run test:generated

# Check spec coverage
npm run coverage:check

# Generate reports
npm run report
```

### 4. Commit Guidelines

Use clear, descriptive commit messages:

```bash
git commit -m "feat: add new authentication method

- Implement OAuth2 flow
- Add token management
- Update API contract"
```

### 5. Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Verify coverage: `npm run coverage:check`
5. Push to your fork
6. Create a Pull Request with description

## Code Standards

### File Organization

- `src/` - Application source code
- `tests/` - Test files
- `tests/generated/` - Auto-generated tests
- `utils/` - Utility scripts
- `openspec/` - Spec-driven artifacts
- `openapi/` - OpenAPI contracts

### Naming Conventions

- Files: kebab-case (e.g., `user-auth.spec.ts`)
- Functions: camelCase (e.g., `generateTests()`)
- Classes: PascalCase (e.g., `UserAuthManager`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Testing Requirements

- All new features must include tests
- Generated tests must pass: `npm run test:generated`
- Manual tests required for new endpoints
- Maintain 100% spec coverage

## Reporting Issues

### Bug Reports

Include:
- Environment (Node version, OS)
- Steps to reproduce
- Expected vs actual behavior
- Test output/logs

### Feature Requests

Include:
- Use case and motivation
- Proposed implementation approach
- Examples or mockups

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for functions
- Document new endpoints in OpenAPI specs
- Update ALLURE_INTEGRATION.md for reporting changes

## Running Locally

```bash
# Start development server
npm start

# Run tests in watch mode
npm test -- --watch

# Generate test reports
npm run report

# View dashboard
open reports/enhanced-dashboard.html
```

## Questions?

- Check existing issues and discussions
- Review ALLURE_INTEGRATION.md for reporting
- Consult README.md for architecture overview

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

Thank you for contributing!