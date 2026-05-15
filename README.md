# AI Automation Framework

![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/playwright-api%20testing-2EAD33?logo=playwright&logoColor=white)
![OpenAPI](https://img.shields.io/badge/openapi-contract--first-6BA539)
![OpenSpec](https://img.shields.io/badge/openspec-spec--driven-4F46E5)
![License](https://img.shields.io/badge/license-MIT-blue)

**LinkedIn-ready subtitle:** Spec-driven API test automation with OpenSpec + OpenAPI + Playwright, including auto-generated tests, traceable requirements, and report-ready outputs.

A spec-driven automation framework that combines OpenSpec change artifacts, OpenAPI contracts, and Playwright-based verification. This repository is focused on practical patterns you can reuse and extend.

## Why This Project Stands Out

- ✅ **Spec-to-test traceability:** requirements in `openspec/` drive executable API tests.
- ✅ **Contract alignment:** tests validate behavior against `openapi/swagger.yaml`.
- ✅ **Portfolio evidence:** Allure + dashboard artifacts are generated for shareable proof.
- ✅ **Reusable pattern:** lightweight generator workflow that can be extended to new endpoints.

## Architecture at a Glance

```text
OpenSpec change artifacts (.md)
        │
        ├──> utils/generate-tests.js
        │         │
        │         └──> tests/generated/*.spec.ts
        │
OpenAPI contract (swagger.yaml)
        │
        └──> Playwright API tests (tests/api + tests/generated)
                          │
                          └──> Allure + enhanced dashboard reports
```

## Project Outcomes

- Converts OpenSpec scenarios into executable Playwright API tests.
- Keeps implementation aligned with API contract and spec artifacts.
- Produces verifiable test evidence through Playwright + Allure + dashboard outputs.
- Demonstrates a reusable workflow teams can adapt for regression-safe API delivery.

## Project Overview

- `openapi/`: OpenAPI contract definitions for the API surface.
- `openspec/`: OpenSpec configuration and change artifacts.
  - `openspec/changes/`: Contains individual OpenSpec change workspaces.
  - `openspec/specs/`: Shared or archived specification artifacts.
- `src/`: Application source code.
- `tests/`: Playwright test suites.
- `playwright.config.ts`: Playwright test runner configuration.

## Quick Start

### Prerequisites

- Node.js 18+ or compatible version
- npm

### Install dependencies

```bash
npm install
```

### Install Playwright browsers

```bash
npm run install:browsers
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

## LinkedIn Portfolio Checklist

Use this checklist to publish a strong project showcase:

1. Run `npm run report` and capture:
   - Allure summary screenshot
   - Enhanced dashboard screenshot
   - Terminal output showing test pass results
2. Add 3 bullets in your post:
   - Problem solved (spec drift and regression risk)
   - Approach (OpenSpec + OpenAPI + Playwright)
   - Measurable proof (test/report artifacts)
3. Include repo link and 2–3 key commands from this README.

### Suggested LinkedIn Post Template

> Built a spec-driven API automation framework using OpenSpec + OpenAPI + Playwright.
> 
> ✔ Auto-generated API tests from requirement specs  
> ✔ Contract-aligned verification  
> ✔ Allure + custom dashboard reporting for traceable evidence
> 
> Stack: Node.js, Playwright, OpenAPI, OpenSpec  
> Repo: <your-link>

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
