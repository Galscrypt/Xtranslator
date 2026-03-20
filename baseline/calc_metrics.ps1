param(
  [string]$RunsFile = "baseline/baseline_runs.csv",
  [string]$CompareA = "",
  [string]$CompareB = ""
)

if (-not (Test-Path $RunsFile)) {
  Write-Error "Runs file not found: $RunsFile"
  exit 1
}

$rows = Import-Csv $RunsFile | Where-Object { $_.run_name -and $_.case_id }
if (-not $rows -or $rows.Count -eq 0) {
  Write-Host "No run rows found in $RunsFile"
  exit 0
}

function ToNum($v) {
  if ($null -eq $v -or $v -eq '') { return $null }
  $n = 0
  if ([double]::TryParse($v.ToString(), [ref]$n)) { return [double]$n }
  return $null
}

function Summarize($name, $set) {
  $n = $set.Count
  $scores = @($set | ForEach-Object { ToNum $_.score_1_5 } | Where-Object { $null -ne $_ })
  $ticker = @($set | ForEach-Object { ToNum $_.ticker_preserved } | Where-Object { $null -ne $_ })
  $slang = @($set | ForEach-Object { ToNum $_.slang_correct } | Where-Object { $null -ne $_ })
  $garbage = @($set | ForEach-Object { ToNum $_.garbage } | Where-Object { $null -ne $_ })

  $avgScore = if ($scores.Count -gt 0) { [math]::Round((($scores | Measure-Object -Average).Average), 3) } else { $null }
  $tickerRate = if ($ticker.Count -gt 0) { [math]::Round((($ticker | Measure-Object -Average).Average) * 100, 2) } else { $null }
  $slangRate = if ($slang.Count -gt 0) { [math]::Round((($slang | Measure-Object -Average).Average) * 100, 2) } else { $null }
  $garbageRate = if ($garbage.Count -gt 0) { [math]::Round((($garbage | Measure-Object -Average).Average) * 100, 2) } else { $null }

  [pscustomobject]@{
    run_name = $name
    samples = $n
    avg_score_1_5 = $avgScore
    ticker_preserve_rate_pct = $tickerRate
    slang_correct_rate_pct = $slangRate
    garbage_rate_pct = $garbageRate
  }
}

$groups = $rows | Group-Object run_name
$summary = foreach ($g in $groups) { Summarize $g.Name $g.Group }

Write-Host "=== Baseline Summary ==="
$summary | Sort-Object run_name | Format-Table -AutoSize

if ($CompareA -and $CompareB) {
  $a = $summary | Where-Object { $_.run_name -eq $CompareA }
  $b = $summary | Where-Object { $_.run_name -eq $CompareB }
  if ($a -and $b) {
    Write-Host "`n=== Delta ($CompareB - $CompareA) ==="
    [pscustomobject]@{
      avg_score_1_5_delta = if ($null -ne $a.avg_score_1_5 -and $null -ne $b.avg_score_1_5) { [math]::Round(($b.avg_score_1_5 - $a.avg_score_1_5), 3) } else { $null }
      ticker_preserve_rate_pct_delta = if ($null -ne $a.ticker_preserve_rate_pct -and $null -ne $b.ticker_preserve_rate_pct) { [math]::Round(($b.ticker_preserve_rate_pct - $a.ticker_preserve_rate_pct), 2) } else { $null }
      slang_correct_rate_pct_delta = if ($null -ne $a.slang_correct_rate_pct -and $null -ne $b.slang_correct_rate_pct) { [math]::Round(($b.slang_correct_rate_pct - $a.slang_correct_rate_pct), 2) } else { $null }
      garbage_rate_pct_delta = if ($null -ne $a.garbage_rate_pct -and $null -ne $b.garbage_rate_pct) { [math]::Round(($b.garbage_rate_pct - $a.garbage_rate_pct), 2) } else { $null }
    } | Format-List
  } else {
    Write-Warning "One of compare runs not found: $CompareA / $CompareB"
  }
}
