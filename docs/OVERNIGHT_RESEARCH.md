# Overnight Research Workflow

This document explains how to run the overnight research workflow for the A-share research workspace.

## Overview

The overnight research workflow:
- Fetches market/theme data from configured data provider (or falls back to mock)
- Runs opportunity screening and strategy scoring
- Generates a structured Chinese research report
- Saves reports to `reports/` directory (both Markdown and JSON)

## Quick Start

### Run manually

```bash
npm run research:nightly
```

This will:
1. Fetch the latest research data
2. Build the workspace with analytics
3. Generate opportunity screening
4. Save a timestamped report to `reports/`
5. Update `reports/latest-report.md` and `reports/latest-report.json`

## Windows PowerShell Overnight Setup

### Method 1: Run before sleep (simple)

1. Open PowerShell as Administrator
2. Navigate to project directory:
   ```powershell
   cd c:\quantize
   ```
3. Run the research workflow:
   ```powershell
   npm run research:nightly
   ```
4. Keep the PowerShell window open overnight
5. In the morning, check `reports/latest-report.md`

### Method 2: Prevent computer sleep

To keep the computer from sleeping overnight:

**Option A: Power Settings (Recommended)**
1. Open Settings > System > Power & sleep
2. Set "Sleep" to "Never" when plugged in
3. Set "Screen" to turn off after desired time (e.g., 10 minutes)
4. After the report is generated in the morning, revert to normal settings

**Option B: PowerShell command to prevent sleep temporarily**
```powershell
# Prevent sleep while running
powercfg /change standby-timeout-ac 0

# Run the research
npm run research:nightly

# Re-enable sleep after completion (e.g., 30 minutes)
powercfg /change standby-timeout-ac 30
```

**Option C: Use a tool like PowerToys Awake**
1. Install Microsoft PowerToys from Microsoft Store
2. Enable "Awake" utility
3. Set to "Keep awake indefinitely" while running the workflow
4. Disable after completion

### Method 3: Run in background with logging

To run in background and capture logs:

```powershell
# Create a log directory if it doesn't exist
New-Item -ItemType Directory -Force -Path logs

# Run in background with output redirection
Start-Process -FilePath "npm" -ArgumentList "run","research:nightly" -RedirectStandardOutput "logs\research-$(Get-Date -Format 'yyyyMMdd-HHmmss').log" -RedirectStandardError "logs\error-$(Get-Date -Format 'yyyyMMdd-HHmmss').log" -NoNewWindow -Wait
```

### Method 4: Scheduled Task (Windows Task Scheduler)

To run automatically at a specific time:

1. Open Task Scheduler (taskschd.msc)
2. Click "Create Task"
3. General tab:
   - Name: "Quantize Overnight Research"
   - Select "Run whether user is logged on or not"
   - Check "Do not store password"
4. Triggers tab:
   - Click "New"
   - Begin the task: "On a schedule"
   - Set daily run time (e.g., 2:00 AM)
5. Actions tab:
   - Click "New"
   - Program/script: `C:\Program Files\nodejs\npm.cmd`
   - Add arguments: `run research:nightly`
   - Start in: `c:\quantize`
6. Conditions tab:
   - Uncheck "Start the task only if the computer is on AC power"
   - Check "Wake the computer to run this task"
7. Settings tab:
   - Check "Allow task to be run on demand"
   - Check "Run task as soon as possible after a scheduled start is missed"

## Stopping the Process Safely

If you need to stop the research workflow:

```powershell
# Find the node/tsx process
Get-Process | Where-Object {$_.ProcessName -like "node*" -or $_.ProcessName -like "tsx*"}

# Stop it gracefully (Ctrl+C in the terminal)
# Or force kill if needed:
Stop-Process -Id <PID> -Force
```

## Report Output

Reports are saved to the `reports/` directory:

- `research-YYYY-MM-DDTHH-mm-ss.json` - Full JSON snapshot
- `research-YYYY-MM-DDTHH-mm-ss.md` - Chinese markdown report
- `latest-report.json` - Symlink/copy to most recent JSON
- `latest-report.md` - Symlink/copy to most recent markdown

## Report Contents

Each report includes:

- **Metadata**: Generation time, data provider status, scan counts, duration
- **Market Leadership**: Top themes by today/5-day/20-day heat, market narrative
- **Core Themes**: Detailed analysis of top 3 themes with diagnostics
- **Opportunities**:
  - Long-term watchlist candidates
  - Short-term momentum candidates
  - Dividend/defensive candidates
  - High-risk speculative themes
  - Ranked by various scores (quality, market strength, etc.)
- **Evidence Analysis**: Bullish/bearish evidence, invalidation conditions
- **Watchlist Notes**: Summary observations
- **Safety Notice**: Clear disclaimer that this is research only, not investment advice

## Data Provider Configuration

The workflow uses the configured data adapter:

- Set `DATA_PROVIDER` environment variable to choose:
  - `akshare` - Akshare adapter (requires Python data-service)
  - `tushare` - Tushare adapter (requires token)
  - `mock` - Mock adapter (default fallback)

Example:
```powershell
$env:DATA_PROVIDER="akshare"
npm run research:nightly
```

If the configured provider fails, it automatically falls back to mock data.

## Scheduling Options

### Local Manual
- Run `npm run research:nightly` before sleep

### Local Scheduled
- Use Windows Task Scheduler (see Method 4 above)

### GitHub Actions (Optional)
Create `.github/workflows/nightly-research.yml`:
```yaml
name: Nightly Research
on:
  schedule:
    - cron: '0 18 * * *'  # 2 AM Beijing time (18:00 UTC)
  workflow_dispatch:

jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run research:nightly
      - uses: actions/upload-artifact@v4
        with:
          name: research-report
          path: reports/
```

### Render/VPS Cron (Optional)
```bash
# Add to crontab
0 2 * * * cd /path/to/quantize && npm run research:nightly >> /var/log/research.log 2>&1
```

### Vercel Cron (Not Recommended)
Vercel cron jobs have execution time limits and are not suitable for long-running data fetching tasks. Use a dedicated server or local machine instead.

## Troubleshooting

### Script fails with "tsx not found"
```bash
npm install
```

### Permission denied creating reports directory
- Run PowerShell as Administrator
- Or manually create the `reports/` folder

### Data provider fails
- Check environment variables
- Verify Python data-service is running (for Akshare)
- Check Tushare token configuration
- The script will automatically fall back to mock data

### Computer sleeps during execution
- Use Method 2 above to prevent sleep
- Or use Task Scheduler with "Wake the computer" option

## Viewing Reports

### In the app
Navigate to `/reports` in the web application to view the latest generated report.

### Directly
Open `reports/latest-report.md` in any markdown viewer or text editor.

## Safety Notes

- This workflow is for **research only**, not trading
- No real orders are placed
- All conclusions depend on data quality
- Mock data may differ from actual market conditions
- Always verify with real data before making decisions
