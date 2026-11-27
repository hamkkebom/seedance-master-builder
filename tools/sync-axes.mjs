#!/usr/bin/env node
/*
 * axes.json 생성기 — 축·프리셋의 원본은 seedance-master-builder.html 안의 AXES·BUILTIN_PRESETS다.
 * 이 스크립트가 그 원본을 읽어 axes.json과 seedance-llm/axes.json을 만든다. 손으로 고치지 말 것.
 *
 *   node tools/sync-axes.mjs           두 json 파일을 새로 쓴다 (축을 고친 뒤 실행)
 *   node tools/sync-axes.mjs --check   HTML과 json이 다르면 차이를 보여 주고 실패(종료 코드 1) — CI용
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML_FILE = join(root, 'seedance-master-builder.html');
const OUTPUTS = [join(root, 'axes.json'), join(root, 'seedance-llm', 'axes.json')];

/* 본체 스크립트에서 `const NAME = [` 로 시작해 줄 맨 앞 `];` 로 끝나는 데이터 덩어리를 잘라 낸다 */
function sliceLiteral(lines, name) {
  const start = lines.findIndex(line => line.startsWith(`const ${name} = [`));
  if (start === -1) throw new Error(`${name} 정의를 찾지 못했습니다`);
  const end = lines.findIndex((line, index) => index > start && line.startsWith('];'));
  if (end === -1) throw new Error(`${name} 정의의 끝(];)을 찾지 못했습니다`);
  return { start, end };
}

export function readMakerData(htmlText) {
  const lines = htmlText.split(/\r?\n/);
  const scriptStart = lines.findIndex(line => line.trim() === '<script>');
  const axes = sliceLiteral(lines, 'AXES');
  const presets = sliceLiteral(lines, 'BUILTIN_PRESETS');
  /* AXES 앞부분(화자 옵션 상수 등)은 순수 데이터라 함께 실행한다. DOM은 쓰지 않는다 */
  const code = [
    lines.slice(scriptStart + 1, axes.end + 1).join('\n'),
    lines.slice(presets.start, presets.end + 1).join('\n'),
    'globalThis.__out = { AXES, BUILTIN_PRESETS };'
  ].join('\n');
  const context = vm.createContext({});
  vm.runInContext(code, context, { filename: 'maker-data.js', timeout: 2000 });
  return context.__out;
}

export function buildRegistry({ AXES, BUILTIN_PRESETS }) {
  return {
    meta: {
      axesCount: AXES.length,
      presetsCount: BUILTIN_PRESETS.length,
      generatedFrom: 'seedance-master-builder.html (AXES·BUILTIN_PRESETS) — node tools/sync-axes.mjs 로 생성, 직접 수정 금지'
    },
    axes: AXES.map(axis => ({
      id: axis.id,
      title: axis.title,
      tag: axis.tag,
      type: axis.type,
      group: axis.group,
      requires: axis.requires || [],
      dependsOn: axis.dependsOn || {},
      options: axis.options.map(option => {
        const out = { key: option.k, label: option.label };
        if (option.requires && option.requires.length) out.requires = option.requires;
        /* 사람이 직접 고를 때만 쓰는 값(예: 길이 직접 입력). LLM 스키마에서는 빠지고, 검증기는 유효로 본다 */
        if (option.manualOnly) out.manualOnly = true;
        return out;
      })
    })),
    /* 카테고리가 없는 프리셋은 메이커 화면과 같이 '콘텐츠'로 묶는다 (renderBuiltinPresets와 같은 규칙) */
    presets: BUILTIN_PRESETS.map(preset => ({ id: preset.id, name: preset.name, icon: preset.icon, category: preset.category || '콘텐츠' }))
  };
}

function diffSummary(expected, actual) {
  const notes = [];
  const byId = list => new Map((list || []).map(item => [item.id, item]));
  const want = byId(expected.axes);
  const have = byId(actual.axes);
  want.forEach((axis, id) => {
    const other = have.get(id);
    if (!other) { notes.push(`축 없음: ${id}`); return; }
    const keys = axis.options.map(option => option.key);
    const otherKeys = other.options.map(option => option.key);
    keys.filter(key => !otherKeys.includes(key)).forEach(key => notes.push(`${id}: 키 없음 "${key}"`));
    otherKeys.filter(key => !keys.includes(key)).forEach(key => notes.push(`${id}: 원본에 없는 키 "${key}"`));
    if (JSON.stringify(axis) !== JSON.stringify(other) && !notes.some(note => note.startsWith(`${id}:`))) notes.push(`${id}: 제목·라벨·조건이 다름`);
  });
  have.forEach((_, id) => { if (!want.has(id)) notes.push(`원본에 없는 축: ${id}`); });
  if (JSON.stringify(expected.presets) !== JSON.stringify(actual.presets)) notes.push('프리셋 목록이 다름');
  return notes;
}

function main() {
  const registry = buildRegistry(readMakerData(readFileSync(HTML_FILE, 'utf8')));
  const text = `${JSON.stringify(registry, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    let failed = false;
    OUTPUTS.forEach(file => {
      let current = '';
      try { current = readFileSync(file, 'utf8').replace(/\r\n/g, '\n'); } catch { /* 없으면 다름 */ }
      if (current === text) return;
      failed = true;
      let notes = ['파일이 없거나 JSON이 아님'];
      try { notes = diffSummary(registry, JSON.parse(current)); } catch { /* 위 메모 유지 */ }
      console.error(`✗ ${file} 가 HTML의 축 정의와 다릅니다:\n  - ${(notes.length ? notes : ['형식·순서 차이']).slice(0, 20).join('\n  - ')}`);
    });
    if (failed) {
      console.error('\n고치는 법: node tools/sync-axes.mjs 를 실행해 json을 다시 만든 뒤 커밋하세요.');
      process.exit(1);
    }
    console.log(`✓ axes.json 2개가 HTML과 같습니다 (축 ${registry.meta.axesCount}개 · 프리셋 ${registry.meta.presetsCount}개)`);
    return;
  }
  OUTPUTS.forEach(file => writeFileSync(file, text));
  console.log(`axes.json 2개를 새로 썼습니다 (축 ${registry.meta.axesCount}개 · 프리셋 ${registry.meta.presetsCount}개)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
