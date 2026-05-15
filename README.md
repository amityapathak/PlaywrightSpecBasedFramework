# AI Automation Framework

A spec-driven automation framework that combines OpenSpec change artifacts, OpenAPI contracts, and Playwright-based verification. This repository is focused on practical patterns you can reuse and extend.

## Project Overview

- `openapi/`: OpenAPI contract definitions for the API surface.
- `openspec/`: OpenSpec configuration and change artifacts.
  - `openspec/changes/`: Contains individual OpenSpec change workspaces.
  - `openspec/specs/`: Shared or archived specification artifacts.
- `src/`: Application source code.
- `tests/`: Playwright test suites.
- `playwright.config.ts`: Playwright test runner configuration.

## Getting Started

### Prerequisites

- Node.js 18+ or compatible version
- npm

### Install dependencies

```bash
npm install
```

### Install Playwright browsers

```bash
npx playwright install
```

> Playwright UI/browser tests require browser binaries. Run the install command once per environment.

### Run the server

```bash
npm start
```

The server is implemented in `src/server.js` and exposes a `POST /login` endpoint.

### Run tests

```bash
npm test
```

This runs the curated product-facing test suites (`tests/api` and `tests/generated`).

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

## Reporting

Comprehensive test reporting with Allure, integrated with the traceability dashboard:

```bash
npm run test:allure
npm run allure:generate
npm run allure:open
npm run report
```

Reports produced by this repository:

- `allure-report/index.html` (when generated)
- `reports/enhanced-dashboard.html` (when generated)
- `reports/spec-coverage.json` (when generated)

## OpenSpec Workflow

Use the OpenSpec CLI to manage change artifacts and track implementation readiness.

```bash
openspec new change "<change-name>"
openspec status --change "<change-name>"
openspec instructions proposal --change "<change-name>" --json
```

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

- This project intentionally avoids inflated benchmark claims in docs unless accompanied by reproducible evidence.
- If you add performance or ROI claims, include measurement method and artifacts in the repository.
