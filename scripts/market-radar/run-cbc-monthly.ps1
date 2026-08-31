[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$TestInvalidCbc
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$LogsDirectory = Join-Path $ProjectRoot 'data\market-radar\logs'
$ProcessedDirectory = Join-Path $ProjectRoot 'data\market-radar\processed'
$LivePath = Join-Path $ProjectRoot 'public\data\market-radar\live\cbc-housing-finance-latest.json'
$LastRunPath = Join-Path $ProcessedDirectory 'cbc-last-run.json'
$CyclePath = Join-Path $PSScriptRoot 'run-cbc-monthly-cycle.mjs'
$RunnerPath = Join-Path $PSScriptRoot 'run-update-job.mjs'
$VerifyPath = Join-Path $PSScriptRoot 'verify-cbc-runtime.mjs'

New-Item -ItemType Directory -Force -Path $LogsDirectory, $ProcessedDirectory | Out-Null
$StartedAt = (Get-Date).ToUniversalTime().ToString('o')
$LogPath = Join-Path $LogsDirectory ("cbc-monthly-{0}.log" -f (Get-Date -Format 'yyyy-MM-dd'))

function Get-FileSha256([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Write-RuntimeLog([hashtable]$Record) {
    $safeRecord = [ordered]@{
        startedAt = $Record.startedAt
        finishedAt = $Record.finishedAt
        jobId = $Record.jobId
        status = $Record.status
        previousPeriod = $Record.previousPeriod
        candidatePeriod = $Record.candidatePeriod
        qualityPassed = $Record.qualityPassed
        published = $Record.published
        safeMessage = $Record.safeMessage
        durationMs = $Record.durationMs
        dryRun = $Record.dryRun
    }
    ($safeRecord | ConvertTo-Json -Compress) | Add-Content -LiteralPath $LogPath -Encoding utf8
    $safeRecord | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $LastRunPath -Encoding utf8
}

function Complete-Runtime([hashtable]$Record, [int]$ExitCode) {
    $Record.finishedAt = (Get-Date).ToUniversalTime().ToString('o')
    $Record.durationMs = [int](([DateTime]::Parse($Record.finishedAt) - [DateTime]::Parse($Record.startedAt)).TotalMilliseconds)
    Write-RuntimeLog $Record
    $Record | ConvertTo-Json -Depth 7
    exit $ExitCode
}

if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Complete-Runtime @{ startedAt = $StartedAt; jobId = 'cbc-monthly-refresh'; status = 'failed'; previousPeriod = $null; candidatePeriod = $null; qualityPassed = $false; published = $false; safeMessage = 'Node.js runtime unavailable'; dryRun = [bool]$DryRun } 1
}

if ([string]::IsNullOrWhiteSpace($env:NODE_OPTIONS)) {
    $env:NODE_OPTIONS = '--use-system-ca'
}

Push-Location $ProjectRoot
try {
    $HashBefore = Get-FileSha256 $LivePath
    if ($TestInvalidCbc) {
        $RawOutput = & node $RunnerPath 'cbc-monthly-refresh' '--publish' '--candidate' (Join-Path $ProcessedDirectory 'invalid-cbc-candidate.json') '--trigger' 'manual' 2>&1
        $NodeExitCode = $LASTEXITCODE
    } else {
        $RawOutput = & node $CyclePath '--trigger' 'manual' 2>&1
        $NodeExitCode = $LASTEXITCODE
    }
    $RawText = ($RawOutput | Out-String).Trim()
    $Parsed = $null
    try { $Parsed = $RawText | ConvertFrom-Json -ErrorAction Stop } catch { }
    $HashAfter = Get-FileSha256 $LivePath

    if ($null -eq $Parsed) {
        Complete-Runtime @{ startedAt = $StartedAt; jobId = 'cbc-monthly-refresh'; status = 'failed'; previousPeriod = $null; candidatePeriod = $null; qualityPassed = $false; published = $false; safeMessage = 'CBC runner did not return structured JSON'; dryRun = [bool]$DryRun } 1
    }

    $Job = if ($Parsed.job) { $Parsed.job } else { $Parsed }
    $Status = [string]$Job.status
    $PreviousPeriod = if ($Parsed.currentPeriod) { [string]$Parsed.currentPeriod } elseif ($Job.previousDataPeriod.start) { [string]$Job.previousDataPeriod.start } else { $null }
    $CandidatePeriod = if ($Parsed.expectedDataPeriod) { [string]$Parsed.expectedDataPeriod } elseif ($Job.candidateDataPeriod.start) { [string]$Job.candidateDataPeriod.start } else { $null }
    $Published = [bool]$Job.published
    $QualityPassed = if ($Status -eq 'skipped') { $true } else { [bool]$Job.qualityPassed }
    # Keep runtime strings ASCII-only: Windows PowerShell 5 may parse no-BOM UTF-8 scripts using a legacy code page.
    $SafeMessage = if ($Status -eq 'skipped') { 'No new official CBC period detected; existing CBC LIVE data was retained.' } elseif ($Status -eq 'published') { 'CBC candidate was published locally; manual deployment review remains required.' } else { 'CBC monthly refresh failed safely; existing LIVE data was preserved.' }

    if ($Status -eq 'skipped' -and $HashBefore -ne $HashAfter) {
        Complete-Runtime @{ startedAt = $StartedAt; jobId = 'cbc-monthly-refresh'; status = 'failed'; previousPeriod = $PreviousPeriod; candidatePeriod = $CandidatePeriod; qualityPassed = $false; published = $false; safeMessage = 'SKIPPED result changed CBC LIVE unexpectedly'; dryRun = [bool]$DryRun } 1
    }

    # A skipped check remains local-only so the tracked public update-status.json stays clean.
    # A future publish path performs validation and rollback within the existing runner/workflow contract.
    & node $VerifyPath | Out-Null
    $VerificationExitCode = $LASTEXITCODE
    if ($VerificationExitCode -ne 0 -and $Status -ne 'failed') {
        Complete-Runtime @{ startedAt = $StartedAt; jobId = 'cbc-monthly-refresh'; status = 'failed'; previousPeriod = $PreviousPeriod; candidatePeriod = $CandidatePeriod; qualityPassed = $false; published = $false; safeMessage = 'CBC runtime verification failed safely'; dryRun = [bool]$DryRun } 1
    }

    $ExitCode = if ($Status -in @('skipped', 'published', 'staged') -and $NodeExitCode -eq 0) { 0 } else { 1 }
    Complete-Runtime @{ startedAt = $StartedAt; jobId = 'cbc-monthly-refresh'; status = $Status; previousPeriod = $PreviousPeriod; candidatePeriod = $CandidatePeriod; qualityPassed = $QualityPassed; published = $Published; safeMessage = $SafeMessage; dryRun = [bool]$DryRun; cbcLiveSha256Before = $HashBefore; cbcLiveSha256After = $HashAfter } $ExitCode
} catch {
    Complete-Runtime @{ startedAt = $StartedAt; jobId = 'cbc-monthly-refresh'; status = 'failed'; previousPeriod = $null; candidatePeriod = $null; qualityPassed = $false; published = $false; safeMessage = 'CBC runtime failed safely; existing LIVE data was preserved.'; dryRun = [bool]$DryRun } 1
} finally {
    Pop-Location
}
