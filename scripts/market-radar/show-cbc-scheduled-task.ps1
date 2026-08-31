$TaskName = 'E.X Market Radar - CBC Monthly Refresh'
$Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -eq $Task) {
    [pscustomobject]@{ taskName = $TaskName; exists = $false; enabled = $false; safeMessage = 'Scheduled task is not installed.' } | ConvertTo-Json
    exit 0
}
$Info = Get-ScheduledTaskInfo -TaskName $TaskName
$LastRunTime = if ($Info.LastRunTime -and $Info.LastRunTime.Year -gt 2000) { $Info.LastRunTime.ToString('o') } else { $null }
$NextRunTime = if ($Info.NextRunTime -and $Info.NextRunTime.Year -gt 2000) { $Info.NextRunTime.ToString('o') } else { $null }
[pscustomobject]@{ taskName = $TaskName; exists = $true; enabled = ($Task.State -ne 'Disabled'); state = [string]$Task.State; lastRunTime = $LastRunTime; lastTaskResult = $Info.LastTaskResult; nextRunTime = $NextRunTime } | ConvertTo-Json
