param(
  [Parameter(Mandatory = $true)]
  [string]$RunName,
  [string]$CasesFile = "baseline/baseline_cases.csv",
  [string]$RunsFile = "baseline/baseline_runs.csv",
  [switch]$ReplaceExisting
)

if (-not (Test-Path $CasesFile)) {
  Write-Error "Cases file not found: $CasesFile"
  exit 1
}

$cases = Import-Csv $CasesFile | Where-Object { $_.case_id }
if (-not $cases -or $cases.Count -eq 0) {
  Write-Error "No cases found in $CasesFile"
  exit 1
}

if (-not (Test-Path $RunsFile)) {
  "run_name,case_id,actual_ru,ticker_preserved,slang_correct,garbage,score_1_5,notes" | Set-Content $RunsFile -Encoding UTF8
}

$existing = Import-Csv $RunsFile
$already = @($existing | Where-Object { $_.run_name -eq $RunName })
if ($already.Count -gt 0 -and -not $ReplaceExisting) {
  Write-Host "Run template already exists for '$RunName' ($($already.Count) rows)."
  Write-Host "Use -ReplaceExisting to recreate."
  exit 0
}

if ($already.Count -gt 0 -and $ReplaceExisting) {
  $existing = @($existing | Where-Object { $_.run_name -ne $RunName })
}

$newRows = foreach ($c in $cases) {
  [pscustomobject]@{
    run_name = $RunName
    case_id = $c.case_id
    actual_ru = ""
    ticker_preserved = ""
    slang_correct = ""
    garbage = ""
    score_1_5 = ""
    notes = ""
  }
}

$result = @($existing + $newRows)
$result | Export-Csv -Path $RunsFile -NoTypeInformation -Encoding UTF8

Write-Host "Created template '$RunName' with $($newRows.Count) rows in $RunsFile"
