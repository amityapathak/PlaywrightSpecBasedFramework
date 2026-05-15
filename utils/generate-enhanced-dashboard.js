const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const coveragePath = path.join(repoRoot, 'reports', 'spec-coverage.json');
const allureResultsPath = path.join(repoRoot, 'allure-results');
const enhancedDashboardPath = path.join(repoRoot, 'reports', 'enhanced-dashboard.html');

function parseAllureResults() {
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    broken: 0,
    unknown: 0,
    duration: 0,
    testResults: []
  };

  if (!fs.existsSync(allureResultsPath)) {
    return stats;
  }

  const resultFiles = fs.readdirSync(allureResultsPath)
    .filter(file => file.endsWith('-result.json'));

  resultFiles.forEach(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(allureResultsPath, file), 'utf8'));
      stats.total++;

      switch (content.status) {
        case 'passed':
          stats.passed++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'skipped':
          stats.skipped++;
          break;
        case 'broken':
          stats.broken++;
          break;
        default:
          stats.unknown++;
      }

      stats.duration += content.stop - content.start || 0;

      stats.testResults.push({
        name: content.name,
        status: content.status,
        duration: content.stop - content.start || 0,
        fullName: content.fullName,
        historyId: content.historyId
      });
    } catch (e) {
      // Skip invalid files
    }
  });

  return stats;
}

function generateEnhancedDashboard(coverage, allureStats) {
  const passRate = allureStats.total > 0 ? ((allureStats.passed / allureStats.total) * 100).toFixed(1) : 0;
  const failRate = allureStats.total > 0 ? ((allureStats.failed / allureStats.total) * 100).toFixed(1) : 0;
  const skipRate = allureStats.total > 0 ? ((allureStats.skipped / allureStats.total) * 100).toFixed(1) : 0;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Enhanced OpenSpec Traceability Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
    .stat-number { font-size: 2em; font-weight: bold; margin: 10px 0; }
    .passed { color: #28a745; }
    .failed { color: #dc3545; }
    .skipped { color: #ffc107; }
    .total { color: #007bff; }
    .charts-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .chart-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .coverage-section { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f8f9fa; font-weight: 600; }
    .covered { background-color: #d4edda; color: #155724; }
    .not-covered { background-color: #f8d7da; color: #721c24; }
    .test-passed { background-color: #d4edda; }
    .test-failed { background-color: #f8d7da; }
    .test-skipped { background-color: #fff3cd; }
    .test-broken { background-color: #f5c6cb; }
    .duration { font-size: 0.9em; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Enhanced OpenSpec Traceability Dashboard</h1>
    <p>Generated on ${new Date().toISOString()} | Integrated with Allure Reporting</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <h3>Total Tests</h3>
      <div class="stat-number total">${allureStats.total}</div>
    </div>
    <div class="stat-card">
      <h3>Passed</h3>
      <div class="stat-number passed">${allureStats.passed}</div>
      <div>${passRate}%</div>
    </div>
    <div class="stat-card">
      <h3>Failed</h3>
      <div class="stat-number failed">${allureStats.failed}</div>
      <div>${failRate}%</div>
    </div>
    <div class="stat-card">
      <h3>Skipped</h3>
      <div class="stat-number skipped">${allureStats.skipped}</div>
      <div>${skipRate}%</div>
    </div>
  </div>

  <div class="charts-container">
    <div class="chart-card">
      <h3>Test Results Distribution</h3>
      <canvas id="resultsChart" width="400" height="300"></canvas>
    </div>
    <div class="chart-card">
      <h3>Test Duration Trend</h3>
      <canvas id="durationChart" width="400" height="300"></canvas>
    </div>
  </div>

  <div class="coverage-section">
    <h2>📋 Spec Coverage Report</h2>
    <h3>Change: ${coverage.changeName}</h3>
    ${Object.entries(coverage.capabilities).map(([capability, data]) => `
      <h4>Capability: ${capability}</h4>
      <table>
        <tr><th>Requirement</th><th>Test Status</th><th>Coverage</th></tr>
        ${data.requirements.map(req => `<tr><td>${req}</td><td class="covered">✅ Covered</td><td>Manual Test</td></tr>`).join('')}
        ${data.aiGenerated.map(req => `<tr><td>${req}</td><td class="covered">🤖 AI Generated</td><td>Auto Test</td></tr>`).join('')}
      </table>
    `).join('')}
  </div>

  <div class="coverage-section">
    <h2>🧪 Detailed Test Results</h2>
    <table>
      <tr><th>Test Name</th><th>Status</th><th>Duration</th><th>Full Name</th></tr>
      ${allureStats.testResults.map(test => `
        <tr class="test-${test.status}">
          <td>${test.name}</td>
          <td>${test.status.toUpperCase()}</td>
          <td class="duration">${(test.duration / 1000).toFixed(2)}s</td>
          <td>${test.fullName}</td>
        </tr>
      `).join('')}
    </table>
  </div>

  <script>
    // Test Results Pie Chart
    const resultsCtx = document.getElementById('resultsChart').getContext('2d');
    new Chart(resultsCtx, {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Skipped', 'Broken', 'Unknown'],
        datasets: [{
          data: [${allureStats.passed}, ${allureStats.failed}, ${allureStats.skipped}, ${allureStats.broken}, ${allureStats.unknown}],
          backgroundColor: ['#28a745', '#dc3545', '#ffc107', '#fd7e14', '#6c757d'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Duration Chart (showing last 10 tests)
    const durationCtx = document.getElementById('durationChart').getContext('2d');
    const recentTests = ${JSON.stringify(allureStats.testResults.slice(-10))};
    new Chart(durationCtx, {
      type: 'bar',
      data: {
        labels: recentTests.map(t => t.name.substring(0, 20) + '...'),
        datasets: [{
          label: 'Duration (seconds)',
          data: recentTests.map(t => (t.duration / 1000).toFixed(2)),
          backgroundColor: recentTests.map(t =>
            t.status === 'passed' ? '#28a745' :
            t.status === 'failed' ? '#dc3545' : '#ffc107'
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  </script>
</body>
</html>
  `;

  fs.mkdirSync(path.dirname(enhancedDashboardPath), { recursive: true });
  fs.writeFileSync(enhancedDashboardPath, html);
}

function main() {
  if (!fs.existsSync(coveragePath)) {
    console.error('Coverage report not found. Run generate-tests first.');
    process.exit(1);
  }

  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const allureStats = parseAllureResults();

  generateEnhancedDashboard(coverage, allureStats);
  console.log(`Generated enhanced dashboard: ${path.relative(repoRoot, enhancedDashboardPath)}`);

  // Auto-open the dashboard
  const { exec } = require('child_process');
  exec(`open ${enhancedDashboardPath}`, (error) => {
    if (error) {
      console.log(`Dashboard generated. Open manually: ${enhancedDashboardPath}`);
    }
  });
}

main();