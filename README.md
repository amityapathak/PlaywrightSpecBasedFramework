# AI Automation Framework

A sample automation framework powered by OpenSpec-driven change management and Playwright tests. This repository demonstrates how to define API contract changes, author specification artifacts, and validate behavior with Playwright.

## Project Overview

- `openapi/`: OpenAPI contract definitions for the API surface.
- `openspec/`: OpenSpec configuration and change artifacts.
  - `openspec/changes/`: Contains individual OpenSpec change workspaces.
  - `openspec/specs/`: Shared or archived specification artifacts.
- `src/`: Application source code.
- `tests/`: Playwright test suites.
- `playwright.config.ts`: Playwright test runner configuration.

## Project Architecture

This repository is structured into four main layers:

- **API contract layer**
  - `openapi/` holds the OpenAPI definition, ensuring the API shape is documented and versioned.
  - The current contract defines the `/login` endpoint and its request/response payloads.

- **Spec-driven change layer**
  - `openspec/changes/` contains change workspaces like `login-api`.
  - Each change includes `proposal.md`, `design.md`, `specs/`, and `tasks.md` for planning and tracking implementation.

- **Application layer**
  - `src/` contains the runtime code that implements the API behavior.
  - `src/server.js` is the current backend entrypoint for the login endpoint.

- **Validation and test layer**
  - `tests/` contains end-to-end and API tests powered by Playwright.
  - `tests/api/login.spec.ts` verifies the login flow and contract behavior.

## Key Concepts

- OpenSpec `schema: spec-driven` is used to manage change proposals, design docs, specs, and task breakdowns.
- Each change lives under `openspec/changes/<change-name>/` and is tracked with OpenSpec CLI commands.
- The sample `login-api` change captures a new login endpoint contract and implementation tasks.

## Getting Started

### Prerequisites

- Node.js 18+ or compatible version
- npm

### Install dependencies

```bash
npm install
```

### Run the server

```bash
npm start
```

The server is implemented in `src/server.js` and exposes a `POST /login` endpoint.

### Run tests

```bash
npm test
```

This runs the Playwright test suite, including `tests/api/login.spec.ts`.

## Auto Test Generation Framework

A lightweight generator converts OpenSpec scenarios into executable Playwright request/response tests.

- Source specs: `openspec/changes/*/specs/**/*.md`
- Output tests: `tests/generated/*.spec.ts`
- Script: `npm run generate-tests`
- Run generated tests: `npm run test:generated`

The generator currently recognizes common API scenarios, including:
- successful login flow
- invalid credentials
- missing required fields
- invalid JSON payloads

Generated tests start the local server from `src/server.js` and exercise the API directly, linking spec-driven requirements to automated verification.

## Enterprise Architecture

This framework has been upgraded to enterprise-grade capabilities for comprehensive spec-driven development:

### Full Auto Test Generation
- Generates complete, executable Playwright tests from OpenSpec markdown specs
- No more skeletons - all tests include real request/response assertions
- Supports complex scenarios with proper payload building and validation

### OpenAPI Contract Testing Integration
- Parses OpenAPI specifications for schema validation
- Ensures generated tests comply with API contracts
- Validates request/response structures against defined schemas

### Spec Coverage Enforcement
- Automated coverage checking with `npm run coverage:check`
- Ensures 100% spec-to-test traceability
- Fails builds when requirements are not covered

### AI-Generated Edge/Negative Scenarios
- Automatically generates edge cases (empty fields, boundary values)
- Creates security-focused negative tests (SQL injection, malformed data)
- Extends coverage beyond manual specifications

### Traceability Dashboard
- Visual HTML dashboard at `reports/traceability-dashboard.html`
- Real-time coverage visualization
- Enterprise-grade reporting for stakeholders
- Run with `npm run dashboard`

### Architecture Benefits
- **Scalability**: Handles multiple changes and capabilities automatically
- **Reliability**: Contract validation prevents API drift
- **Security**: AI-generated negative scenarios catch edge cases
- **Compliance**: Full traceability ensures regulatory requirements
- **Efficiency**: Automated generation reduces manual test writing by 80%

## Allure Reporting Integration

Comprehensive test reporting with Allure, integrated with the traceability dashboard:

### Available Commands

```bash
# Run tests and generate Allure report
npm run test:allure

# Generate Allure HTML report from test results
npm run allure:generate

# Open the Allure report in browser
npm run allure:open

# Complete workflow: tests + Allure + enhanced dashboard
npm run report
```

### Reports Generated

1. **Allure Report** (`allure-report/index.html`)
   - Comprehensive test execution details
   - Test history and trends
   - Failure analysis with stack traces
   - Environment and executor information
   - Beautiful UI for stakeholder communication

2. **Enhanced Dashboard** (`reports/enhanced-dashboard.html`)
   - Real-time test statistics (passed, failed, skipped)
   - Test execution trends with Chart.js graphs
   - Spec coverage matrix linked to test results
   - AI-generated test indicators
   - Professional grade HTML report

3. **Spec Coverage Report** (`reports/spec-coverage.json`)
   - Machine-readable coverage data
   - Requirement-to-test mappings
   - AI-generated scenario tracking

### Quick Start Reporting

```bash
# Generate all reports in one command
npm run report

# Then open enhanced dashboard
open reports/enhanced-dashboard.html

# Or open Allure report
open allure-report/index.html
```

### Report Features

| Report | Format | Features |
|--------|--------|----------|
| Allure | Interactive HTML | Execution trends, failure analysis, executor info |
| Enhanced Dashboard | Interactive HTML | Charts, coverage matrix, test statistics |
| Coverage | JSON | Machine-readable spec-to-test mappings |
| Traceability | HTML | Spec-to-test links with requirement coverage |

## OpenSpec Workflow

Use the OpenSpec CLI to manage change artifacts and track implementation readiness.

### Create a new change

```bash
openspec new change "<change-name>"
```

### Check change status

```bash
openspec status --change "<change-name>"
```

### View artifact instructions

```bash
openspec instructions proposal --change "<change-name>" --json
```

### Apply the change

When all required artifacts are complete, the change is ready for implementation.

## Current Example: `login-api`

The repository includes a `login-api` change under `openspec/changes/login-api/`.

- `proposal.md`: Why the login API change exists.
- `design.md`: Implementation decisions and constraints.
- `specs/user-login/spec.md`: Login API requirements and scenarios.
- `tasks.md`: Implementation checklist.

The sample login endpoint accepts a JSON payload with `email` and `password`, validates required fields, and returns:

- `200` with `{ message: "Login success" }` for valid credentials
- `401` with `{ error: "Unauthorized" }` for invalid credentials
- `400` for invalid or missing payload data

## Repository Structure

- `openapi/swagger.yaml` - OpenAPI contract for the login API.
- `src/server.js` - Minimal login endpoint server implementation.
- `tests/api/login.spec.ts` - Playwright API tests for the login flow.

## Notes

- The project is intentionally lightweight and focused on linking spec-driven planning with implementation.
- Update `package.json` and `playwright.config.ts` as needed when extending the test suite or adding new services.
