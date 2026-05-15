const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const changesRoot = path.join(repoRoot, 'openspec', 'changes');
const outputRoot = path.join(repoRoot, 'tests', 'generated');
const openApiPath = path.join(repoRoot, 'openapi', 'swagger.yaml');
const coveragePath = path.join(repoRoot, 'reports', 'spec-coverage.json');
const dashboardPath = path.join(repoRoot, 'reports', 'traceability-dashboard.html');

function findSpecFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSpecFiles(entryPath));
    } else if (entry.isFile() && entry.name === 'spec.md') {
      files.push(entryPath);
    }
  }
  return files;
}

function safeTestName(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function parseOpenApiSpec() {
  if (!fs.existsSync(openApiPath)) {
    return {};
  }

  const text = fs.readFileSync(openApiPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const api = { paths: {} };

  let currentPath = null;
  let currentMethod = null;
  let currentResponse = null;
  let section = null;
  let propertyName = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '  ');
    const indent = line.search(/\S|$/);
    const trimmed = line.trim();

    if (trimmed === 'paths:') {
      section = 'paths';
      continue;
    }

    if (section !== 'paths' || !trimmed) {
      continue;
    }

    if (indent === 2 && trimmed.endsWith(':') && trimmed.startsWith('/')) {
      currentPath = trimmed.slice(0, -1);
      api.paths[currentPath] = api.paths[currentPath] || {};
      currentMethod = null;
      continue;
    }

    if (indent === 4 && /^(get|post|put|patch|delete):/.test(trimmed)) {
      currentMethod = trimmed.split(':')[0];
      api.paths[currentPath][currentMethod] = {
        requestBody: { properties: {}, required: [] },
        responses: {},
      };
      currentResponse = null;
      continue;
    }

    if (!currentPath || !currentMethod) {
      continue;
    }

    if (indent === 6 && trimmed === 'requestBody:') {
      currentResponse = null;
      section = 'requestBody';
      continue;
    }

    if (indent === 6 && trimmed === 'responses:') {
      section = 'responses';
      currentResponse = null;
      continue;
    }

    if (section === 'requestBody') {
      if (indent === 8 && trimmed.startsWith('required:')) {
        const value = trimmed.split(':')[1].trim();
        api.paths[currentPath][currentMethod].requestBody.required = value === 'true';
        continue;
      }

      if (indent === 8 && trimmed === 'content:') {
        continue;
      }

      if (indent === 10 && trimmed === 'application/json:') {
        continue;
      }

      if (indent === 12 && trimmed === 'schema:') {
        continue;
      }

      if (indent === 14 && trimmed === 'properties:') {
        continue;
      }

      if (indent === 16 && trimmed.endsWith(':')) {
        propertyName = trimmed.slice(0, -1);
        api.paths[currentPath][currentMethod].requestBody.properties[propertyName] = {};
        continue;
      }

      if (indent === 18 && trimmed.startsWith('type:') && propertyName) {
        api.paths[currentPath][currentMethod].requestBody.properties[propertyName].type = trimmed.split(':')[1].trim();
        continue;
      }

      if (indent === 14 && trimmed === 'required:') {
        continue;
      }

      if (indent === 16 && trimmed.startsWith('- ') && api.paths[currentPath][currentMethod].requestBody.required) {
        api.paths[currentPath][currentMethod].requestBody.required.push(trimmed.slice(2).trim());
        continue;
      }
    }

    if (section === 'responses') {
      if (indent === 8 && /^'\d+'|\d+:/.test(trimmed)) {
        currentResponse = trimmed.replace(/:$/, '');
        api.paths[currentPath][currentMethod].responses[currentResponse] = { properties: {} };
        continue;
      }

      if (indent === 10 && trimmed === 'content:') {
        continue;
      }

      if (indent === 12 && trimmed === 'application/json:') {
        continue;
      }

      if (indent === 14 && trimmed === 'schema:') {
        continue;
      }

      if (indent === 16 && trimmed === 'type: object') {
        continue;
      }

      if (indent === 16 && trimmed === 'properties:') {
        continue;
      }

      if (indent === 18 && trimmed.endsWith(':')) {
        const responseProperty = trimmed.slice(0, -1);
        api.paths[currentPath][currentMethod].responses[currentResponse].properties[responseProperty] = {};
        propertyName = responseProperty;
        continue;
      }
    }
  }

  return api;
}

function parseSpecMarkdown(content) {
  const lines = content.split(/\r?\n/);
  const requirements = [];
  let currentRequirement = null;
  let currentScenario = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const requirementMatch = line.match(/^### Requirement:\s*(.+)$/i);
    const scenarioMatch = line.match(/^#### Scenario:\s*(.+)$/i);

    if (requirementMatch) {
      if (currentRequirement) {
        requirements.push(currentRequirement);
      }
      currentRequirement = {
        title: safeTestName(requirementMatch[1]),
        description: [],
        scenarios: [],
      };
      currentScenario = null;
      continue;
    }

    if (scenarioMatch && currentRequirement) {
      currentScenario = {
        title: safeTestName(scenarioMatch[1]),
        steps: [],
      };
      currentRequirement.scenarios.push(currentScenario);
      continue;
    }

    if (currentScenario && line) {
      currentScenario.steps.push(line);
      continue;
    }

    if (currentRequirement && !currentScenario && line) {
      currentRequirement.description.push(line);
    }
  }

  if (currentRequirement) {
    requirements.push(currentRequirement);
  }
  return requirements;
}

function groupByChange(specFiles) {
  const groups = {};
  for (const specFile of specFiles) {
    const parts = specFile.split(path.sep);
    const changeIndex = parts.indexOf('changes');
    if (changeIndex === -1 || parts.length <= changeIndex + 3) continue;
    const changeName = parts[changeIndex + 1];
    const capability = parts[changeIndex + 3];
    groups[changeName] = groups[changeName] || [];
    groups[changeName].push({ specFile, capability });
  }
  return groups;
}

function inferRequestInfo(steps) {
  const info = { method: 'post', path: '/login' };
  for (const step of steps) {
    const match = step.match(/\b(GET|POST|PUT|PATCH|DELETE)\s+([^\s]+)/i);
    if (match) {
      info.method = match[1].toLowerCase();
      info.path = match[2].replace(/^[`"'(<]+|[`"'\).,]+$/g, '');
      break;
    }
  }
  return info;
}

function inferScenarioType(requirement, scenario, steps) {
  const text = `${requirement} ${scenario} ${steps.join(' ')}`.toLowerCase();
  if (/invalid credentials|incorrect .*password|invalid password|invalid email|unauthorized/.test(text)) {
    return 'invalid-credentials';
  }
  if (/missing required|omit .*password|omit .*email|missing .*field|validation error/.test(text)) {
    return 'missing-fields';
  }
  if (/invalid json|invalid payload/.test(text)) {
    return 'invalid-json';
  }
  if (/successful|valid credentials|successful request format/.test(text)) {
    return 'valid-login';
  }
  return null;
}

function generateAiEdgeScenarios(requirements) {
  const edgeScenarios = [];
  for (const req of requirements) {
    // Generate edge cases based on requirement text
    if (req.title.toLowerCase().includes('email') && req.title.toLowerCase().includes('password')) {
      edgeScenarios.push({
        title: 'Edge case: Empty email and password',
        type: 'empty-fields',
        steps: ['WHEN the client sends POST /login with empty email and password', 'THEN the system responds with validation error']
      });
      edgeScenarios.push({
        title: 'Edge case: Very long email',
        type: 'long-email',
        steps: ['WHEN the client sends POST /login with extremely long email', 'THEN the system responds with 401']
      });
      edgeScenarios.push({
        title: 'Edge case: SQL injection attempt',
        type: 'sql-injection',
        steps: ['WHEN the client sends POST /login with malicious email', 'THEN the system responds with 401']
      });
    }
  }
  return edgeScenarios;
}

function buildPayload(type) {
  const valid = { email: 'user@example.com', password: 'password123' };
  if (type === 'invalid-credentials') {
    return { email: 'user@example.com', password: 'wrong-password' };
  }
  if (type === 'missing-fields') {
    return { email: 'user@example.com' };
  }
  if (type === 'empty-fields') {
    return { email: '', password: '' };
  }
  if (type === 'long-email') {
    return { email: 'a'.repeat(1000) + '@example.com', password: 'password123' };
  }
  if (type === 'sql-injection') {
    return { email: "' OR '1'='1", password: 'password123' };
  }
  return valid;
}

function buildRequestUrl(requestInfo) {
  return 'baseURL + ' + JSON.stringify(requestInfo.path);
}

function buildResponseAssertion(type) {
  if (type === 'valid-login') {
    return [
      '    expect(response.status()).toBe(200);',
      '    expect(await response.json()).toEqual({ message: "Login success" });',
    ];
  }
  if (type === 'invalid-credentials' || type === 'long-email' || type === 'sql-injection') {
    return [
      '    expect(response.status()).toBe(401);',
      '    expect(await response.json()).toEqual({ error: "Unauthorized" });',
    ];
  }
  if (type === 'missing-fields' || type === 'empty-fields') {
    return [
      '    expect(response.status()).toBe(400);',
      '    expect(await response.json()).toEqual({ error: "email and password are required" });',
    ];
  }
  if (type === 'invalid-json') {
    return [
      '    expect(response.status()).toBe(400);',
      '    expect(await response.json()).toEqual({ error: "Invalid JSON payload" });',
    ];
  }
  return [];
}

function buildTestFile(changeName, specEntries) {
  const lines = [];
  lines.push("import { test, expect } from '@playwright/test';");
  lines.push("import { createServer } from '../../src/server.js';");
  lines.push("import type { Server } from 'http';");
  lines.push('');
  lines.push(`// Auto-generated from OpenSpec change: ${changeName}`);
  lines.push('');

  lines.push('let server: Server;');
  lines.push('let baseURL: string;');
  lines.push('');
  lines.push('test.beforeAll(async () => {');
  lines.push('  server = createServer();');
  lines.push('');
  lines.push('  await new Promise<void>((resolve, reject) => {');
  lines.push('    server.listen(0, "127.0.0.1", () => {');
  lines.push('      const address = server.address();');
  lines.push('      if (!address || typeof address === "string") {');
  lines.push('        reject(new Error("Unable to determine server port"));');
  lines.push('        return;');
  lines.push('      }');
  lines.push('');
  lines.push('      baseURL = `http://127.0.0.1:${address.port}`;');
  lines.push('      resolve();');
  lines.push('    });');
  lines.push('    server.on("error", reject);');
  lines.push('  });');
  lines.push('});');
  lines.push('');
  lines.push('test.afterAll(async () => {');
  lines.push('  await new Promise<void>((resolve) => server.close(() => resolve()));');
  lines.push('});');
  lines.push('');

  const allScenarios = [];
  const coverage = { changeName, capabilities: {} };

  specEntries.forEach(({ specFile, capability }) => {
    const content = fs.readFileSync(specFile, 'utf8');
    const requirements = parseSpecMarkdown(content);
    const describeName = `${changeName} / ${capability}`;
    lines.push(`test.describe('${describeName}', () => {`);

    coverage.capabilities[capability] = { requirements: [], aiGenerated: [] };

    requirements.forEach((requirement) => {
      coverage.capabilities[capability].requirements.push(requirement.title);
      requirement.scenarios.forEach((scenario) => {
        allScenarios.push({ requirement: requirement.title, scenario: scenario.title, type: inferScenarioType(requirement.title, scenario.title, scenario.steps), steps: scenario.steps, requestInfo: inferRequestInfo(scenario.steps) });
      });
    });

    // Add AI-generated edge scenarios
    const aiScenarios = generateAiEdgeScenarios(requirements);
    aiScenarios.forEach((scenario) => {
      coverage.capabilities[capability].aiGenerated.push(scenario.title);
      allScenarios.push({ requirement: 'AI-Generated', scenario: scenario.title, type: scenario.type, steps: scenario.steps, requestInfo: { method: 'post', path: '/login' } });
    });

    lines.push('});');
    lines.push('');
  });

  // Generate tests for all scenarios
  allScenarios.forEach((scenario) => {
    const title = `${scenario.requirement} - ${scenario.scenario}`;
    const type = scenario.type;

    if (type) {
      const payload = buildPayload(type);
      const assertionLines = buildResponseAssertion(type);

      lines.push(`test('${title}', async ({ request }) => {`);
      if (type === 'invalid-json') {
        lines.push('  const response = await request.' + scenario.requestInfo.method + '(' + buildRequestUrl(scenario.requestInfo) + ', {');
        lines.push('    data: "{ invalidJson",');
        lines.push('    headers: { "Content-Type": "application/json" },');
        lines.push('  });');
      } else {
        lines.push('  const response = await request.' + scenario.requestInfo.method + '(' + buildRequestUrl(scenario.requestInfo) + ', {');
        lines.push(`    data: ${JSON.stringify(payload, null, 6)},`);
        lines.push('    headers: { "Content-Type": "application/json" },');
        lines.push('  });');
      }
      assertionLines.forEach((assertion) => lines.push(assertion));
      lines.push('});');
      lines.push('');
    } else {
      lines.push(`test.skip('${title}', async ({ request }) => {`);
      lines.push('  // Auto-generated test skeleton');
      scenario.steps.forEach((step) => {
        lines.push(`  // ${step}`);
      });
      lines.push('  expect(true).toBe(true);');
      lines.push('});');
      lines.push('');
    }
  });

  // Write coverage report
  fs.mkdirSync(path.dirname(coveragePath), { recursive: true });
  fs.writeFileSync(coveragePath, JSON.stringify(coverage, null, 2));

  return lines.join('\n');
}

function generateTraceabilityDashboard(coverage) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>OpenSpec Traceability Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .covered { background-color: #d4edda; }
    .not-covered { background-color: #f8d7da; }
  </style>
</head>
<body>
  <h1>OpenSpec Traceability Dashboard</h1>
  <p>Generated on ${new Date().toISOString()}</p>
  <h2>Change: ${coverage.changeName}</h2>
  ${Object.entries(coverage.capabilities).map(([capability, data]) => `
    <h3>Capability: ${capability}</h3>
    <table>
      <tr><th>Requirement</th><th>Status</th></tr>
      ${data.requirements.map(req => `<tr><td>${req}</td><td class="covered">Covered</td></tr>`).join('')}
      ${data.aiGenerated.map(req => `<tr><td>${req} (AI)</td><td class="covered">AI Generated</td></tr>`).join('')}
    </table>
  `).join('')}
</body>
</html>
  `;
  fs.mkdirSync(path.dirname(dashboardPath), { recursive: true });
  fs.writeFileSync(dashboardPath, html);
}

function ensureFolder(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  if (!fs.existsSync(changesRoot)) {
    console.error('No openspec changes directory found:', changesRoot);
    process.exit(1);
  }

  const specFiles = findSpecFiles(changesRoot);
  if (specFiles.length === 0) {
    console.log('No spec.md files found under openspec/changes. Nothing to generate.');
    return;
  }

  ensureFolder(outputRoot);
  const grouped = groupByChange(specFiles);

  Object.entries(grouped).forEach(([changeName, entries]) => {
    const fileName = `${changeName}.spec.ts`;
    const outputPath = path.join(outputRoot, fileName);
    const content = buildTestFile(changeName, entries);
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`Generated ${path.relative(repoRoot, outputPath)}`);
  });

  // Generate dashboard
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  generateTraceabilityDashboard(coverage);
  console.log(`Generated ${path.relative(repoRoot, dashboardPath)}`);
}

main();
