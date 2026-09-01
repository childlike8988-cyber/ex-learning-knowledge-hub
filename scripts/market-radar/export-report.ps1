[CmdletBinding()]
param([switch]$DryRun, [switch]$PngOnly, [switch]$PdfOnly, [switch]$Overwrite, [string]$Output, [string]$ReportDate)
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$LastRunPath = Join-Path $ProjectRoot 'data\market-radar\processed\report-export-last-run.json'
function Complete($Result, [int]$Code) { New-Item -ItemType Directory -Force -Path (Split-Path -Parent $LastRunPath) | Out-Null; $Result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $LastRunPath -Encoding utf8; $Result | ConvertTo-Json -Depth 8; exit $Code }
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm -ErrorAction SilentlyContinue)) { Complete @{status='failed';safeMessage='Node.js runtime unavailable'} 1 }
Push-Location $ProjectRoot
try { npm.cmd run build; if ($LASTEXITCODE -ne 0) { Complete @{status='failed';safeMessage='Production static build failed; no export was generated.'} 1 }; $arguments = @((Join-Path $PSScriptRoot 'export-report.mjs')); if ($DryRun) { $arguments += '--dry-run' }; if ($PngOnly) { $arguments += '--png-only' }; if ($PdfOnly) { $arguments += '--pdf-only' }; if ($Overwrite) { $arguments += '--overwrite' }; if ($Output) { $arguments += @('--output', $Output) }; if ($ReportDate) { $arguments += @('--report-date', $ReportDate) }; $raw = & node @arguments; $code = $LASTEXITCODE; try { $result = ($raw | Out-String | ConvertFrom-Json) } catch { Complete @{status='failed';safeMessage='Export CLI did not return structured JSON.'} 1 }; Complete $result $code } finally { Pop-Location }

