[CmdletBinding()]
param([switch]$Replace)
$ErrorActionPreference='Stop'; $TaskName='E.X Market Radar - MOI Latest Refresh'; $ProjectRoot=Split-Path -Parent (Split-Path -Parent $PSScriptRoot); $Shim=Join-Path $PSScriptRoot 'run-moi-latest-task.cmd'
$existing=Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if($existing -and -not $Replace){[pscustomobject]@{taskName=$TaskName;created=$false;enabled=($existing.State -ne 'Disabled');safeMessage='Task already exists; no existing task was replaced.'}|ConvertTo-Json;exit 0}
if(-not(Test-Path -LiteralPath $Shim)){throw 'MOI Task Scheduler shim is missing.'}
$run='cmd.exe /d /c call \"{0}\"' -f $Shim; $user="$env:USERDOMAIN\$env:USERNAME"; $line='/Create /TN "{0}" /TR "{1}" /SC MONTHLY /MO 1 /D 1 /ST 08:30 /RU "{2}" /IT /RL LIMITED /F' -f $TaskName,$run,$user
$psi=New-Object System.Diagnostics.ProcessStartInfo; $psi.FileName="$env:SystemRoot\System32\schtasks.exe"; $psi.Arguments=$line; $psi.UseShellExecute=$false; $process=[Diagnostics.Process]::Start($psi);$process.WaitForExit();if($process.ExitCode -ne 0){throw 'Windows Task Scheduler could not create the MOI task.'}
try {[xml]$xml=Export-ScheduledTask -TaskName $TaskName; $base=$xml.Task.Triggers.CalendarTrigger;if(-not $base){throw 'Windows Task Scheduler monthly trigger could not be verified.'};foreach($day in 2,3,11,12,13,21,22,23){$clone=$base.CloneNode($true);$clone.ScheduleByMonth.DaysOfMonth.Day=[string]$day;[void]$xml.Task.Triggers.AppendChild($clone)};Register-ScheduledTask -TaskName $TaskName -Xml $xml.OuterXml -Force|Out-Null}catch{Disable-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue|Out-Null;throw}
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries;Set-ScheduledTask -TaskName $TaskName -Settings $settings|Out-Null;Disable-ScheduledTask -TaskName $TaskName|Out-Null
[pscustomobject]@{taskName=$TaskName;created=$true;enabled=$false;schedule='Monthly days 1-3, 11-13, 21-23 at 08:30';multipleInstances='IgnoreNew';executionTimeLimitMinutes=30}|ConvertTo-Json
