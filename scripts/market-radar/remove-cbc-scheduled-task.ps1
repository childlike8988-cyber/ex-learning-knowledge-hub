[CmdletBinding(SupportsShouldProcess)]
param()

$TaskName = 'E.X Market Radar - CBC Monthly Refresh'
$Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -eq $Task) {
    [pscustomobject]@{ taskName = $TaskName; removed = $false; safeMessage = 'Scheduled task is not installed.' } | ConvertTo-Json
    exit 0
}
if ($PSCmdlet.ShouldProcess($TaskName, 'Unregister only the CBC monthly refresh task')) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}
[pscustomobject]@{ taskName = $TaskName; removed = $true } | ConvertTo-Json
