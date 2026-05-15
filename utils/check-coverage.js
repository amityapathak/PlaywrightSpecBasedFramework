const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const coveragePath = path.join(repoRoot, 'reports', 'spec-coverage.json');
const generatedTestsPath = path.join(repoRoot, 'tests', 'generated');

function checkCoverage() {
  if (!fs.existsSync(coveragePath)) {
    console.error('Coverage report not found. Run generate-tests first.');
    process.exit(1);
  }

  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  let allCovered = true;

  console.log('Spec Coverage Report:');
  console.log('=====================');

  for (const [capability, data] of Object.entries(coverage.capabilities)) {
    console.log(`\nCapability: ${capability}`);
    console.log(`Requirements: ${data.requirements.length}`);
    console.log(`AI Generated: ${data.aiGenerated.length}`);

    // Check if generated tests exist
    const testFile = path.join(generatedTestsPath, `${coverage.changeName}.spec.ts`);
    if (!fs.existsSync(testFile)) {
      console.log(`❌ Test file missing: ${path.relative(repoRoot, testFile)}`);
      allCovered = false;
      continue;
    }

    const testContent = fs.readFileSync(testFile, 'utf8');
    const testTitles = testContent.match(/test\('([^']+)'/g) || [];
    const testNames = testTitles.map(t => t.match(/test\('([^']+)'/)[1]);

    // Check each requirement has at least one test
    for (const req of data.requirements) {
      const hasTest = testNames.some(name => name.includes(req));
      console.log(`${hasTest ? '✅' : '❌'} ${req}`);
      if (!hasTest) allCovered = false;
    }

    // Check AI generated scenarios
    for (const aiReq of data.aiGenerated) {
      const hasTest = testNames.some(name => name.includes(aiReq));
      console.log(`${hasTest ? '✅' : '❌'} ${aiReq} (AI)`);
      if (!hasTest) allCovered = false;
    }
  }

  console.log('\n=====================');
  if (allCovered) {
    console.log('✅ All specs are covered by tests!');
    process.exit(0);
  } else {
    console.log('❌ Some specs are not covered by tests.');
    process.exit(1);
  }
}

checkCoverage();