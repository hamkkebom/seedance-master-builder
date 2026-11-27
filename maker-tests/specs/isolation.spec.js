import { test, expect } from '@playwright/test';
import { blockNetwork, writeVariant } from './helpers.js';

/* 탭 스크립트 하나를 일부러 고장 내도 메이커 본체와 다른 탭은 그대로 동작해야 한다 */
async function expectMakerAlive(page) {
  await page.waitForFunction(() => document.querySelectorAll('#slots > *').length > 0);
  await expect(page.locator('#promptOut')).toContainText('【任务类型】');
  expect(await page.evaluate(() => typeof renderBuiltinPresets)).toBe('function');   // 본체 뒷부분(프리셋)까지 실행됨
}

test('업그레이드 탭이 불러오는 중 오류를 내면 그 탭만 빠진다', async ({ page }, testInfo) => {
  const url = writeVariant(testInfo, 'upgrade-throws', html =>
    html.replace("const GEMINI_MODEL = 'gemini-3.5-flash';", "throw new Error('고장 시험');\nconst GEMINI_MODEL = 'gemini-3.5-flash';"));
  await blockNetwork(page);
  await page.goto(url);
  await expectMakerAlive(page);
  expect(await page.evaluate(() => AITabs.list())).toEqual(['once', 'chat']);
  await expect(page.locator('#aiPanelUpgrade')).toBeHidden();
  await expect(page.locator('#aiStatus')).toContainText('「영상 업그레이드 (A→B)」 탭을 불러오지 못했습니다');
  await page.click('#aiTabChat');
  await expect(page.locator('#aiPanelChat')).toBeVisible();
});

test('자유대화 탭에 문법 오류가 있어도 나머지는 동작한다', async ({ page }, testInfo) => {
  const url = writeVariant(testInfo, 'chat-syntax', html =>
    html.replace('let chatDefaultOverrides = new Set();', 'let chatDefaultOverrides = new Set(;'));
  await blockNetwork(page);
  await page.goto(url);
  await expectMakerAlive(page);
  expect(await page.evaluate(() => AITabs.list())).toEqual(['once', 'upgrade']);
  await expect(page.locator('#aiStatus')).toContainText('「자유대화로 기획하기」 탭을 불러오지 못했습니다');
  await page.click('#chatOpenBtn');   // 대화 탭이 없어도 상단 버튼이 오류를 내지 않는다
  await page.click('#aiTabUpgrade');
  await expect(page.locator('#aiPanelUpgrade')).toBeVisible();
});

test('탭 스크립트 안의 이름은 밖으로 새지 않는다 (다른 스크립트와 이름이 겹쳐도 안전)', async ({ page }) => {
  await blockNetwork(page);
  await page.goto(writeVariant(test.info(), 'same', html => html.replace('<title>', '<title> ')));
  await expectMakerAlive(page);
  const leaked = await page.evaluate(() => ['upAnalyze', 'callGemini', 'sendChatMessage', 'chatPlan', 'onceSubmit'].filter(name => {
    try { return typeof eval(name) !== 'undefined'; } catch { return false; }
  }));
  expect(leaked).toEqual([]);
});
