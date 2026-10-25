$ErrorActionPreference = 'Stop'
$base = 'https://offerpilot-career-agent.haleleaf3.chatgpt.site'
$health = Invoke-RestMethod -Uri "$base/api/health" -TimeoutSec 20
if ($health.product -ne 'production') { throw 'Not the production data flow' }
$state = Invoke-RestMethod -Uri "$base/api/state" -TimeoutSec 20
if ($state.identity -ne 'guest' -or $state.state.profile.name -ne '') { throw 'Anonymous state is not blank' }
if ($state.jobs.Count -lt 1) { throw 'No official jobs synchronized yet' }
if ($state.jobs | Where-Object { $_.kind -ne 'official' -or $_.source -like '*虚构*' }) { throw 'Unexpected job provenance' }
$scheduler = Invoke-RestMethod -Uri "$base/api/scheduler/status" -TimeoutSec 20
if ($scheduler.status -ne 'completed') { throw 'Cloud scheduler has not completed' }
Write-Output "PASS production HTTPS, blank anonymous profile, $($state.jobs.Count) official jobs, completed cloud scheduler"
