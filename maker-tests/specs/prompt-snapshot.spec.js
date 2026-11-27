import { test, expect } from '@playwright/test';
import { openMaker } from './helpers.js';

/*
 * buildPrompt 스냅샷 — 프리셋을 적용했을 때 나오는 중국어 프롬프트 원문을 저장해 두고 비교한다.
 * 프롬프트 조립 코드를 고쳤는데 결과가 달라졌으면 실패한다.
 * 의도한 변경이면: cd maker-tests && npm run test:update 로 스냅샷을 새로 만들고 차이를 확인한 뒤 커밋한다.
 */
const FULL_PRESETS = ['travel', 'ad', 'saju_v3', 'kdrama', 'horror', 'livecomm', 'ad_ytshorts', 'ad_promo_sale', 'ad_brand_story', 'mv_trailer', 'mv_kfantasy', 'mv_docu'];
const BASIC_PRESETS = ['drama', 'ad_ugc'];

async function promptFor(page, presetId, mode) {
  await openMaker(page);
  return page.evaluate(([id, which]) => {
    const preset = BUILTIN_PRESETS.find(item => item.id === id);
    if (!preset) throw new Error(`프리셋 없음: ${id}`);
    applySelection(Object.assign({ axes: preset[which] }, preset.params ? { params: preset.params } : {}));
    renderPrompt();
    return buildPrompt();
  }, [presetId, mode]);
}

for (const id of FULL_PRESETS) {
  test(`프리셋 ${id} (세부 확장) 프롬프트`, async ({ page }) => {
    expect(await promptFor(page, id, 'full')).toMatchSnapshot(`${id}-full.txt`);
  });
}
for (const id of BASIC_PRESETS) {
  test(`프리셋 ${id} (기본) 프롬프트`, async ({ page }) => {
    expect(await promptFor(page, id, 'basic')).toMatchSnapshot(`${id}-basic.txt`);
  });
}

test('콘텐츠·타임라인·직접 입력 길이를 채운 프롬프트', async ({ page }) => {
  await openMaker(page);
  const text = await page.evaluate(() => {
    const preset = BUILTIN_PRESETS.find(item => item.id === 'saju_v3');
    applySelection({ axes: preset.full });
    setMakerDurationSeconds(23);
    setMakerRatio('9:16');
    const fill = (id, value) => { const el = document.getElementById(id); if (el) el.value = value; };
    fill('ci_subject', '韩国年轻情侣与女方父母');
    fill('ci_event', '父亲反对后因사주천궁的궁합结果转为支持');
    fill('ci_scene', '白天的韩国家庭客厅');
    renderPrompt();
    const rows = document.querySelectorAll('#timelineWrap .tl-row');
    rows[0].querySelector('.tl-scene').value = '父亲站起来指着男友';
    rows[0].querySelector('.tl-dialog').value = '이 결혼 절대 허락 못한다!';
    rows[1].querySelector('.tl-scene').value = '手机屏幕显示사주천궁';
    rows[1].querySelector('.tl-dialog').value = '두 분 궁합은 천생연분입니다!';
    rows[1].querySelector('.tl-mode').value = 'vo';
    rows[1].querySelector('.tl-sfx').value = '<手机铃声>';
    renderPrompt();
    return buildPrompt();
  });
  expect(text).toContain('이 결혼 절대 허락 못한다!');
  expect(text).toMatchSnapshot('saju-content-23s.txt');
});
