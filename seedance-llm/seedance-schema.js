/**
 * seedance-schema.js — axes.json 기반 JSON Schema 생성기 (LLM structured output용)
 * Oracle 설계: task-first 2단계 — 1) task만 2) task에 맞게 프루닝된 전체 축
 * 사용: const { buildTaskSchema, buildStateSchema } = require('./seedance-schema');
 */
const fs = require('fs');
const path = require('path');
const registry = JSON.parse(fs.readFileSync(path.join(__dirname, 'axes.json'), 'utf8'));
const AXES = registry.axes;

/** single 축 → {type:'string', enum}, multi 축 → {type:'array', uniqueItems:true, items:{enum}} */
function axisSchema(axis) {
  const keys = axis.options.map(o => o.key);
  const base = { description: `${axis.title} (${axis.group})` };
  if (axis.type === 'multi') {
    return { ...base, type: 'array', uniqueItems: true, items: { type: 'string', enum: keys } };
  }
  return { ...base, type: 'string', enum: keys };
}

/** task 값에 따라 유효한 축만 포함하는 상태 스키마 */
function buildStateSchema(task) {
  if (!['t2v', 'r2v', 'edit', 'ext', 'fl'].includes(task)) {
    throw new Error(`task must be one of t2v|r2v|edit|ext|fl, got: ${task}`);
  }
  const required = [];
  const properties = {};
  for (const axis of AXES) {
    // requires: task가 requires 목록에 없으면 제외 (edit/ext/fl → t2v/r2v 축 비활성)
    if (axis.requires && axis.requires.length && !axis.requires.includes(task)) continue;
    // R2V 축: task=r2v일 때만
    if (axis.tag === 'r2v' && task !== 'r2v') continue;
    // dependsOn 자식은 optional로 포함 (enum만 강제 — 값 검증은 서버에서)
    properties[axis.id] = axisSchema(axis);
    if (axis.tag === 'core' && !(axis.requires && axis.requires.length && !axis.requires.includes(task))) {
      required.push(axis.id);
    }
  }
  // 콘텐츠 필드 (자유 텍스트 — 한국어)
  properties.content = {
    type: 'object',
    additionalProperties: false,
    properties: {
      subject: { type: 'string', description: '주체 — <主体> 치환, 한국어' },
      event: { type: 'string', description: '사건·동작 — <事件概要> 치환, 한국어' },
      scene: { type: 'string', description: '장면·배경, 한국어' },
      dialog: { type: 'string', description: '대사 — 순수 대사(빌더가 {}·언어 자동 부착), 한국어' },
      ending: { type: 'string', description: '끝 상태 — <画面可见的结束状态> 치환, 한국어' },
      constraint: { type: 'string', description: '전체 톤 — <整体基调一句话> 치환, 한국어' },
      cta: { type: 'string', description: '클릭 유도 문구, 한국어' },
      hook: { type: 'string', description: '첫 3초 훅 — 【开头3秒钩子】, 한국어' },
    },
    additionalProperties: false,
  };
  required.push('content');

  return {
    name: 'builder_state',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties,
      required,
    },
  };
}

/** 1단계: task만 결정하는 최소 스키마 */
function buildTaskSchema() {
  return {
    name: 'task_choice',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: { task: { type: 'string', enum: ['t2v', 'r2v', 'edit', 'ext', 'fl'] } },
      required: ['task'],
    },
  };
}

module.exports = { buildTaskSchema, buildStateSchema, AXES, registry };

// CLI: node seedance-schema.js t2v → 스키마 JSON 출력
if (require.main === module) {
  const task = process.argv[2] || 't2v';
  console.log(JSON.stringify(buildStateSchema(task), null, 2));
}
