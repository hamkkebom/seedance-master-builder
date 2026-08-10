# FILE MANIFEST — 파일 무결성 매니페스트 (2026-08-10)

> **용도**: 프로젝트 파일이 소실/변조됐을 때 기준 해시와 비교해 즉시 감지.
> **검증 방법**:
> ```powershell
> Get-ChildItem -LiteralPath "C:\Dev\2026-08-08_193228" -File | Where-Object { $_.Name -ne 'seedance-master-builder.html.bak' } | ForEach-Object { "{0} | {1} | {2}" -f $_.Name, (Get-FileHash -LiteralPath $_.FullName -Algorithm MD5).Hash, $_.Length }
> ```
> **백업**: `powershell -ExecutionPolicy Bypass -File backup.ps1` → `_backup_latest/`에 전체 복사 + 해시 검증

## 📦 핵심 파일 (기준 해시 — 2026-08-10 최종본)

| 파일 | MD5 | 크기 |
|---|---|---|
| `seedance-master-builder.html` | `5B9D35AD4AB8EC48BB1B03AB72C07D59` | 172,835 B (41축 v3.2 — QA 결함 5건 수정: 무효 키 정리) |
| `README.md` | `23E422C8662840DFED316A51119A384B` | 14,670 B |
| `PROJECT_SPEC.md` | `763462D12C109FFAFB2756EC60DEFCAC` | 41,402 B (QA 수치 정정: 프리셋 37·축 41) |
| `LLM_RULES.md` | `4EDA2DBFDD39C48E343AA2BC0E014795` | 15,583 B (QA 정정: 5감정·core 7축) |
| `axes.json` | `41E64109008AB44B7496F3DAFCAF5E52` | 61,633 B (41축 레지스트리 — 단일 진실 공급원) |
| `PROMPT_LLM.md` | `C3C2CA1D7DAA60DEC8C23F04F5893710` | 4,725 B (LLM 주입용 시스템 프롬프트) |
| `seedance-llm\seedance-schema.js` | `9EBF9405EE1817A3DFDFB26B26F3EFB8` | 스키마 생성기 (task-first 2단계) |
| `seedance-llm\seedance-validate.js` | `10963B2E2397FC3C6156A9521DB838F2` | 서버 검증기 (dependsOn 자동 정리) |
| `konti_sajucheongung.html` | `514473DC6F6A8267C1AEDC708C1D1743` | 18,671 B |
| `konti_sajucheongung2.html` | `73B0D8BBBB788AA2F9CD7D5B0345A978` | 17,884 B |
| `konti_sajucheongung3_drama.html` | `01AA0E704364630848C33A04259E4010` | 22,813 B |
| `prompt_sajucheongung2.md` | `9644F48E94B34CB626138322C3D04D0D` | 8,899 B |
| `prompt_sajucheongung3_drama.md` | `B4C5F89A5F4941D0E52534E0B65322C3` | 13,793 B (최종 30초본) |
| `prompt_sajucheongung3_drama_2x20s.md` | `7D6A1F41853FE11A5D5B07655979DDFF` | 22,365 B (2×20초 파생본) |
| `builder_full.png` | `C4EDB3F8FE1AD9C16D35B04783F0CD72` | 245,446 B |
| `backup.ps1` | `11ED33403D03BC5001168DD05BA27980` | 1,965 B (15파일 + 하위폴더 지원) |

## 📁 백업 계층

| 위치 | 내용 | 갱신 |
|---|---|---|
| `_backup_latest/` | 최신 핵심 파일 15종 (스크립트로 갱신) | `backup.ps1` 실행 시 |
| `_kakaotalk_backup/` | 카카오톡 원본 보관 (HTML 73KB·README·SPEC — 구버전) | 고정 |
| `opencode.db` | 세션 transcript (파일 변경 이력 — 소실 시 복구 원천) | 자동 |

## ⚠️ 소실 사건 이력 (2026-08-09)

1. **03:20** — `C:\Dev\2026-08-08_193228` 전체 파일 소실 (원인 불명, 휴지통·섀도우 복사본 없음). DB transcript로 7개 파일 복원.
2. **builder_full.png·.playwright-mcp** — 같은 사건에서 소실, 재생성/대체.
3. **prompt_sajucheongung3_drama.md** — 1차 복원에서 누락 → DB에서 재복원 (13,793 B 확정).
4. **README/SPEC 부분 롤백** — DB 복원 시점 이전 상태로 일부 되돌아감 → 38축 기준으로 재갱신.

> 📌 **교훈**: 이 프로젝트의 유일한 복구 원천은 `opencode.db`(세션 transcript)였다.
> **이제 `_backup_latest/` + `backup.ps1` + 본 매니페스트가 3중 방어선** — 파일 수정 후에는 반드시 `backup.ps1` 실행.
