/**
 * seedance-validate.js — axes.json 기반 서버 검증기
 * Oracle 설계: ①키·구조 검증(registry 대조) ②requires/dependsOn 자동 정리(cleanupDependsOn 미러) ③내용 규칙
 * 반환: { ok, axes, content, warnings[], errors[] } — errors는 LLM 재시도용 구조화 배열
 */
const fs = require('fs');
const path = require('path');
const registry = JSON.parse(fs.readFileSync(path.join(__dirname, 'axes.json'), 'utf8'));
const AXES = registry.axes;

const CORE_LABEL = (axis) => axis.tag === 'core';
const CONTENT_FIELDS = ['subject', 'event', 'scene', 'dialog', 'ending', 'constraint', 'cta', 'hook'];

function findAxis(id) { return AXES.find(a => a.id === id); }
function validKeys(axis) { return axis.options.map(o => o.key); }

/**
 * ① 키·구조 검증 + ② dependsOn/requires 자동 정리
 * @param {object} rawAxes — { axisId: [keys] } (LLM 응답)
 * @param {string} task — task 값 (없으면 rawAxes.task에서)
 */
function validateAxes(rawAxes, task) {
  const warnings = [];
  const errors = [];
  const out = {};

  // task 결정
  task = task || (Array.isArray(rawAxes.task) ? rawAxes.task[0] : rawAxes.task);
  if (!task || !['t2v', 'r2v', 'edit', 'ext', 'fl'].includes(task)) {
    errors.push({ axis: 'task', key: task || '(none)', reason: `task must be t2v|r2v|edit|ext|fl` });
    return { ok: false, axes: {}, content: {}, warnings, errors };
  }
  out.task = [task];

  for (const [axisId, keys] of Object.entries(rawAxes)) {
    if (axisId === 'task' || axisId === 'content') continue;
    const axis = findAxis(axisId);
    if (!axis) {
      errors.push({ axis: axisId, key: null, reason: `unknown axis id "${axisId}" — not in axes.json` });
      continue;
    }
    // requires: task 미충족 → 자동 정리 (warning)
    if (axis.requires && axis.requires.length && !axis.requires.includes(task)) {
      warnings.push({ axis: axisId, reason: `axis requires ${axis.requires.join('/')}, task=${task} → 자동 제외` });
      continue;
    }
    // R2V 축: task≠r2v → 자동 정리
    if (axis.tag === 'r2v' && task !== 'r2v') {
      warnings.push({ axis: axisId, reason: `R2V axis requires task=r2v → 자동 제외` });
      continue;
    }
    const valid = validKeys(axis);
    const arr = Array.isArray(keys) ? keys : (keys == null ? [] : [keys]);
    const okKeys = [];
    const badKeys = [];
    for (const k of arr) {
      if (valid.includes(k)) okKeys.push(k);
      else badKeys.push(k);
    }
    if (badKeys.length) {
      if (okKeys.length === 0) {
        errors.push({ axis: axisId, key: badKeys.join(','), reason: `invalid key(s) — valid: ${valid.join('|')}` });
        continue; // 전부 무효 → 축 버림 (재시도 대상)
      }
      warnings.push({ axis: axisId, reason: `invalid key(s) dropped: ${badKeys.join(',')}` });
    }
    if (okKeys.length) out[axisId] = okKeys;
  }

  // ② dependsOn 자동 정리 (cleanupDependsOn 미러)
  for (const axis of AXES) {
    const deps = axis.dependsOn || {};
    for (const [parentId, allowed] of Object.entries(deps)) {
      if (!out[axis.id]) continue;
      const parentKeys = out[parentId] || [];
      const met = allowed.some(k => parentKeys.includes(k));
      if (!met) {
        const parentTitle = (findAxis(parentId) || {}).title || parentId;
        warnings.push({ axis: axis.id, reason: `dependsOn ${parentTitle}(${allowed.join('/')}) 미충족 → 자동 초기화` });
        delete out[axis.id];
      }
    }
  }

  // 필수 축 누락 확인
  for (const axis of AXES) {
    if (!CORE_LABEL(axis)) continue;
    if (axis.requires && axis.requires.length && !axis.requires.includes(task)) continue;
    if (axis.tag === 'r2v' && task !== 'r2v') continue;
    if (!out[axis.id] && !['task'].includes(axis.id)) {
      errors.push({ axis: axis.id, key: null, reason: `required(core) axis missing — task=${task}` });
    }
  }

  return { ok: errors.length === 0, axes: out, content: {}, warnings, errors };
}

/** ③ 내용 규칙 검증 (콘텐츠 필드) */
function validateContent(content) {
  const warnings = [];
  const errors = [];
  const out = {};
  if (!content || typeof content !== 'object') {
    return { ok: true, content: {}, warnings, errors }; // 콘텐츠는 선택
  }
  for (const f of CONTENT_FIELDS) {
    const v = content[f];
    if (v == null) continue;
    if (typeof v !== 'string') {
      warnings.push({ field: f, reason: `non-string value → 무시` });
      continue;
    }
    out[f] = v.trim();
  }
  // 대사: {} 없이 순수 대사여야 함 — 빌더가 기호·언어 레이블 자동 부착.
  if (out.dialog) {
    if (out.dialog.includes('{') || out.dialog.includes('}')) {
      out.dialog = out.dialog.replace(/[{}]/g, '').trim();
      warnings.push({ field: 'dialog', reason: `{} 제거 — 빌더가 자동 부착` });
    }
  }
  return { ok: errors.length === 0, content: out, warnings, errors };
}

/** 전체 검증 진입점 */
function validate(payload, task) {
  const axRes = validateAxes(payload.axes || {}, task || (payload.axes && payload.axes.task ? (Array.isArray(payload.axes.task) ? payload.axes.task[0] : payload.axes.task) : undefined));
  const ctRes = validateContent(payload.content);
  return {
    ok: axRes.ok && ctRes.ok,
    axes: axRes.axes,
    content: ctRes.content,
    warnings: [...axRes.warnings, ...ctRes.warnings],
    errors: [...axRes.errors, ...ctRes.errors],
  };
}

module.exports = { validateAxes, validateContent, validate, AXES };

// CLI: node seedance-validate.js '{"axes":{"task":["t2v"],"genre":["kdrama"],"duration":["20s"],"lang":["ko"],"emotion":["joy"],"camera":["B"],"audio":["mus"],"musicgenre":["ballad"],"quality":["hd"]},"content":{"subject":"테스트"}}'
if (require.main === module) {
  const input = JSON.parse(process.argv[2] || '{"axes":{"task":["t2v"]}}');
  console.log(JSON.stringify(validate(input), null, 2));
}
