# ============================================================
# Seedance Master Builder — 프로젝트 백업 스크립트
# 사용법: powershell -ExecutionPolicy Bypass -File backup.ps1
# 실행 시: _backup_latest/ 에 핵심 파일 전체를 복사 + 해시 검증
# ============================================================

$ErrorActionPreference = 'Stop'
$src = Split-Path -Parent $MyInvocation.MyCommand.Path
$backup = Join-Path $src '_backup_latest'
New-Item -ItemType Directory -Path $backup -Force | Out-Null

$files = @(
  'seedance-master-builder.html',
  'README.md',
  'README.html',
  'PROJECT_SPEC.md',
  'LLM_RULES.md',
  'axes.json',
  'PROMPT_LLM.md',
  'seedance-llm\seedance-schema.js',
  'seedance-llm\seedance-validate.js',
  'konti_sajucheongung.html',
  'konti_sajucheongung2.html',
  'konti_sajucheongung3_drama.html',
  'prompt_sajucheongung2.md',
  'prompt_sajucheongung3_drama.md',
  'prompt_sajucheongung3_drama_2x20s.md',
  'prompt_25_example_heungbu.md',
  'prompt_builder_25.md',
  'builder_full.png'
)

$ok = 0; $fail = 0
foreach ($f in $files) {
  $sp = Join-Path $src $f
  if (Test-Path -LiteralPath $sp) {
    $dp = Join-Path $backup (Split-Path $f -Parent)
    if ($dp -ne $backup) { New-Item -ItemType Directory -Path $dp -Force | Out-Null }
    Copy-Item -LiteralPath $sp -Destination (Join-Path $backup $f) -Force
    Write-Output "  OK  $f"
    $ok++
  } else {
    Write-Output "  MISS  $f"
    $fail++
  }
}

# 해시 검증 (백업이 원본과 같은지)
$hashOk = 0; $hashFail = 0
foreach ($f in $files) {
  $sp = Join-Path $src $f; $bp = Join-Path $backup $f
  if ((Test-Path -LiteralPath $sp) -and (Test-Path -LiteralPath $bp)) {
    $h1 = (Get-FileHash -LiteralPath $sp -Algorithm MD5).Hash
    $h2 = (Get-FileHash -LiteralPath $bp -Algorithm MD5).Hash
    if ($h1 -eq $h2) { $hashOk++ } else { Write-Output "  HASH MISMATCH  $f"; $hashFail++ }
  }
}

Write-Output ""
Write-Output "=== 백업 완료: $ok 파일 복사 / 해시 일치 $hashOk / 불일치 $hashFail / 누락 $fail ==="
