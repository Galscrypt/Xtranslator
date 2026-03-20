param(
  [Parameter(Mandatory = $true)]
  [string]$RunName,
  [string]$CasesFile = "baseline/baseline_cases.csv",
  [string]$RunsFile = "baseline/baseline_runs.csv",
  [ValidateSet("all", "high", "high_medium")]
  [string]$Scope = "all",
  [int]$FromCaseId = 1
)

function Save-Runs {
  param(
    $Rows,
    [string]$Path
  )
  $Rows | Export-Csv -Path $Path -NoTypeInformation -Encoding UTF8
}

function Default-IfEmpty {
  param(
    [string]$Value,
    [string]$Fallback
  )
  if ([string]::IsNullOrWhiteSpace($Value)) { return $Fallback }
  return $Value
}

function Read-Choice {
  param(
    [string]$Prompt,
    [string]$DefaultValue,
    [string[]]$Allowed
  )

  while ($true) {
    $raw = Read-Host "$Prompt [$DefaultValue]"
    if ([string]::IsNullOrWhiteSpace($raw)) { return $DefaultValue }
    $v = $raw.Trim()
    if ($Allowed -contains $v) { return $v }
    Write-Host ("Allowed values: " + ($Allowed -join ", ")) -ForegroundColor Yellow
  }
}

if (-not (Test-Path $CasesFile)) {
  Write-Error "Cases file not found: $CasesFile"
  exit 1
}

if (-not (Test-Path $RunsFile)) {
  "run_name,case_id,actual_ru,ticker_preserved,slang_correct,garbage,score_1_5,notes" | Set-Content $RunsFile -Encoding UTF8
}

$cases = Import-Csv $CasesFile | Where-Object { $_.case_id } | Sort-Object { [int]$_.case_id }
switch ($Scope) {
  "high" { $cases = $cases | Where-Object { $_.priority -eq "high" } }
  "high_medium" { $cases = $cases | Where-Object { $_.priority -in @("high", "medium") } }
  default {}
}
$cases = $cases | Where-Object { [int]$_.case_id -ge $FromCaseId }

if (-not $cases -or $cases.Count -eq 0) {
  Write-Error "No cases selected (scope=$Scope, from=$FromCaseId)"
  exit 1
}

$runs = @(Import-Csv $RunsFile)

foreach ($c in $cases) {
  $id = [string]$c.case_id
  $exists = $runs | Where-Object { $_.run_name -eq $RunName -and $_.case_id -eq $id } | Select-Object -First 1
  if (-not $exists) {
    $runs += [pscustomobject]@{
      run_name = $RunName
      case_id = $id
      actual_ru = ""
      ticker_preserved = ""
      slang_correct = ""
      garbage = ""
      score_1_5 = ""
      notes = ""
    }
  }
}

Save-Runs -Rows $runs -Path $RunsFile

Write-Host ""
Write-Host "Run: $RunName | Scope: $Scope | Cases: $($cases.Count)" -ForegroundColor Cyan
Write-Host "Empty input keeps current value." -ForegroundColor DarkGray
Write-Host "Type 'q' in actual_ru to stop and save progress." -ForegroundColor DarkGray
Write-Host ""

$idx = 0
foreach ($c in $cases) {
  $idx++
  $id = [string]$c.case_id
  $row = $runs | Where-Object { $_.run_name -eq $RunName -and $_.case_id -eq $id } | Select-Object -First 1
  if (-not $row) { continue }

  Write-Host "[$idx/$($cases.Count)] case_id=$id priority=$($c.priority) category=$($c.category)" -ForegroundColor Green
  Write-Host "SOURCE: $($c.source_text)"
  Write-Host "HINT:   $($c.expected_ru_hint)" -ForegroundColor DarkGray
  Write-Host ""

  $currentActual = [string]$row.actual_ru
  $label = "actual_ru"
  if (-not [string]::IsNullOrWhiteSpace($currentActual)) { $label = "actual_ru [filled]" }
  $rawActual = Read-Host $label

  if ($rawActual -eq "q") {
    Save-Runs -Rows $runs -Path $RunsFile
    Write-Host "Stopped. Progress saved." -ForegroundColor Yellow
    exit 0
  }
  if (-not [string]::IsNullOrWhiteSpace($rawActual)) {
    $row.actual_ru = $rawActual.Trim()
  }

  $row.ticker_preserved = Read-Choice -Prompt "ticker_preserved (1/0)" -DefaultValue (Default-IfEmpty -Value ([string]$row.ticker_preserved) -Fallback "1") -Allowed @("0", "1")
  $row.slang_correct = Read-Choice -Prompt "slang_correct (1/0)" -DefaultValue (Default-IfEmpty -Value ([string]$row.slang_correct) -Fallback "1") -Allowed @("0", "1")
  $row.garbage = Read-Choice -Prompt "garbage (1/0)" -DefaultValue (Default-IfEmpty -Value ([string]$row.garbage) -Fallback "0") -Allowed @("0", "1")
  $row.score_1_5 = Read-Choice -Prompt "score_1_5 (1..5)" -DefaultValue (Default-IfEmpty -Value ([string]$row.score_1_5) -Fallback "4") -Allowed @("1", "2", "3", "4", "5")

  $noteLabel = "notes"
  if (-not [string]::IsNullOrWhiteSpace([string]$row.notes)) { $noteLabel = "notes [filled]" }
  $rawNotes = Read-Host $noteLabel
  if (-not [string]::IsNullOrWhiteSpace($rawNotes)) {
    $row.notes = $rawNotes.Trim()
  }

  Save-Runs -Rows $runs -Path $RunsFile
  Write-Host "Saved." -ForegroundColor Cyan
  Write-Host "----------------------------------------"
}

Write-Host ""
Write-Host "Done. Calculate metrics with:" -ForegroundColor Green
Write-Host "powershell -ExecutionPolicy Bypass -File baseline/calc_metrics.ps1"
