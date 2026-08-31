[CmdletBinding()]
param([switch]$Replace)

$ErrorActionPreference = 'Stop'
$TaskName = 'E.X Market Radar - CBC Monthly Refresh'
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$WrapperPath = Join-Path $PSScriptRoot 'run-cbc-monthly.ps1'
$TaskShimPath = Join-Path $PSScriptRoot 'run-cbc-monthly-task.cmd'
$Existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($Existing -and -not $Replace) {
    [pscustomobject]@{ taskName = $TaskName; created = $false; enabled = ($Existing.State -ne 'Disabled'); safeMessage = 'Task already exists; no existing task was replaced.' } | ConvertTo-Json
    exit 0
}

if (-not (Test-Path -LiteralPath $TaskShimPath)) { throw 'CBC Task Scheduler shim is missing.' }
# schtasks.exe has a 261-character action limit. The small CMD shim retains the absolute project path safely.
$TaskRun = 'cmd.exe /d /c call \"{0}\"' -f $TaskShimPath
$TaskUser = "$env:USERDOMAIN\$env:USERNAME"
# schtasks supplies the supported monthly-day trigger; the wrapper itself always changes to ProjectRoot.
$SchtasksArgumentLine = '/Create /TN "{0}" /TR "{1}" /SC MONTHLY /MO 1 /D 21 /ST 08:30 /RU "{2}" /IT /RL LIMITED /F' -f $TaskName, $TaskRun, $TaskUser
$SchtasksStartInfo = New-Object System.Diagnostics.ProcessStartInfo
$SchtasksStartInfo.FileName = "$env:SystemRoot\System32\schtasks.exe"
$SchtasksStartInfo.Arguments = $SchtasksArgumentLine
$SchtasksStartInfo.UseShellExecute = $false
$SchtasksProcess = [System.Diagnostics.Process]::Start($SchtasksStartInfo)
$SchtasksProcess.WaitForExit()
if ($SchtasksProcess.ExitCode -ne 0) { throw 'Windows Task Scheduler could not create the CBC task.' }
$CreatedTask = $true
try {
    # schtasks supports one day per MONTHLY trigger. Clone its valid monthly XML trigger for days 22-28.
    [xml]$TaskXml = Export-ScheduledTask -TaskName $TaskName
    $BaseTrigger = $TaskXml.Task.Triggers.CalendarTrigger
    if (-not $BaseTrigger -or -not $BaseTrigger.ScheduleByMonth.DaysOfMonth.Day) { throw 'Windows Task Scheduler monthly trigger could not be verified.' }
    foreach ($Day in 22..28) {
        $Clone = $BaseTrigger.CloneNode($true)
        $Clone.ScheduleByMonth.DaysOfMonth.Day = [string]$Day
        [void]$TaskXml.Task.Triggers.AppendChild($Clone)
    }
    Register-ScheduledTask -TaskName $TaskName -Xml $TaskXml.OuterXml -Force | Out-Null
} catch {
    if ($CreatedTask) { Disable-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Out-Null }
    throw
}
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Set-ScheduledTask -TaskName $TaskName -Settings $Settings | Out-Null
Disable-ScheduledTask -TaskName $TaskName | Out-Null
[pscustomobject]@{ taskName = $TaskName; created = $true; enabled = $false; schedule = 'Monthly days 21-28 at 08:30'; multipleInstances = 'IgnoreNew'; executionTimeLimitMinutes = 30 } | ConvertTo-Json
