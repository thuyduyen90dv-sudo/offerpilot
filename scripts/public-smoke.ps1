$ErrorActionPreference = 'Stop'
$base = 'https://offerpilot-career-agent.haleleaf3.chatgpt.site'
$demoSession = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
function Invoke-DemoApi([string]$path, $body = $null) {
  if ($null -eq $body) { return Invoke-RestMethod -Uri "$base/api/$path" -WebSession $demoSession -TimeoutSec 25 }
  $jsonBody = $body | ConvertTo-Json -Depth 20 -Compress
  return Invoke-RestMethod -Uri "$base/api/$path" -Method Post -WebSession $demoSession -Headers @{Origin=$base} -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody)) -TimeoutSec 25
}
function Assert-Demo($condition, [string]$message) { if (-not $condition) { throw "FAIL: $message" } }
$health = Invoke-DemoApi 'health'
Assert-Demo ($health.ok -and $health.storage -eq 'D1') 'health'
$initial = Invoke-DemoApi 'state'
Assert-Demo ($initial.jobs.Count -eq 24 -and $initial.identity -eq 'demo') 'anonymous demo'
Write-Output 'PASS HTTPS, D1 migrations, anonymous Demo'
Invoke-DemoApi 'agent/start' @{} | Out-Null
1..6 | ForEach-Object { Invoke-DemoApi 'agent/tick' @{} | Out-Null }
$current = (Invoke-DemoApi 'state').state
Assert-Demo ($current.runs[0].status -eq 'waiting' -and $current.applications.Count -gt 0) 'agent tools'
Write-Output 'PASS persisted Agent discovery, filter, match, tailoring and approval boundary'
$application = $current.applications[0]
$unauthorizedDenied = $false
try { Invoke-DemoApi 'applications/submit' @{id=$application.id} | Out-Null } catch { $unauthorizedDenied = $_.Exception.Response.StatusCode.value__ -eq 400 }
Assert-Demo $unauthorizedDenied 'unapproved submission denied'
Invoke-DemoApi 'applications/authorize' @{id=$application.id;approved=$true;resumeConfirmed=$true} | Out-Null
$receipt = Invoke-DemoApi 'applications/submit' @{id=$application.id}
Assert-Demo ($receipt.receipt -like 'SIM-*') 'mock receipt'
$repeat = Invoke-DemoApi 'applications/submit' @{id=$application.id}
Assert-Demo ($repeat.receipt -eq $receipt.receipt) 'idempotent receipt'
Invoke-DemoApi 'applications/update' @{id=$application.id;status='面试';notes='公网验收，虚构数据'} | Out-Null
foreach ($other in $current.applications | Select-Object -Skip 1) { Invoke-DemoApi 'applications/update' @{id=$other.id;status='已结束'} | Out-Null }
Invoke-DemoApi 'agent/control' @{action='finish'} | Out-Null
Invoke-DemoApi 'agent/tick' @{} | Out-Null
$current = (Invoke-DemoApi 'state').state
Assert-Demo ($current.runs[0].status -eq 'completed' -and $current.report.submitted -gt 0) 'completed report'
Write-Output 'PASS authorization, actual mock API receipt, duplicate prevention, board and report'
$otherSession = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
$isolated = Invoke-RestMethod -Uri "$base/api/state" -WebSession $otherSession -TimeoutSec 25
Assert-Demo ($isolated.state.applications.Count -eq 0) 'session isolation'
Invoke-DemoApi 'demo/reset' @{} | Out-Null
Assert-Demo ((Invoke-DemoApi 'state').state.applications.Count -eq 0) 'reset'
Write-Output 'PASS public session isolation and Demo reset'
Write-Output 'PUBLIC_SMOKE_ALL_PASS'
