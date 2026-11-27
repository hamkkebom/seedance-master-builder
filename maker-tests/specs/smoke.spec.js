import { test, expect } from '@playwright/test';
import { collectErrors, openMaker } from './helpers.js';

test('메이커가 오류 없이 열리고 탭 3개가 순서대로 등록된다', async ({ page }) => {
  const errors = collectErrors(page);
  await openMaker(page);
  expect(await page.evaluate(() => AITabs.list())).toEqual(['once', 'chat', 'upgrade']);
  await expect(page.locator('#aiTabs .ai-tab')).toHaveText(['한 번에 구성', '💬 자유대화로 기획하기', '🔁 영상 업그레이드 (A→B)']);
  await expect(page.locator('#aiPanelOnce')).toBeVisible();
  await expect(page.locator('#aiPanelChat')).toBeHidden();
  expect(await page.evaluate(() => AXES.length)).toBe(41);
  await expect(page.locator('#promptOut')).toContainText('【任务类型】');
  expect(errors).toEqual([]);
});

test('탭 전환·방향키가 동작하고 자유대화 탭을 열면 대화창이 그려진다', async ({ page }) => {
  await openMaker(page);
  await page.click('#aiTabChat');
  await expect(page.locator('#aiPanelChat')).toBeVisible();
  await expect(page.locator('#aiPanelOnce')).toBeHidden();
  await expect(page.locator('#aiChatLog > *').first()).toBeVisible();
  await page.locator('#aiTabChat').press('ArrowRight');
  await expect(page.locator('#aiTabUpgrade')).toBeFocused();
  await expect(page.locator('#aiPanelUpgrade')).toBeVisible();
});

test('업그레이드 탭 입력칸에서 Enter를 눌러도 페이지가 새로고침되거나 다른 탭이 실행되지 않는다', async ({ page }) => {
  await openMaker(page);
  await page.click('#aiTabUpgrade');
  await page.evaluate(() => { window.__alive = true; });
  const statusBefore = await page.locator('#aiStatus').textContent();
  await page.fill('#upSeconds', '23');
  await page.locator('#upSeconds').press('Enter');
  expect(await page.evaluate(() => window.__alive)).toBe(true);
  await expect(page.locator('#aiStatus')).toHaveText(statusBefore);
});

test('저장 프리셋 이름의 HTML은 글자로만 보이고 실행되지 않는다', async ({ page }) => {
  await openMaker(page);
  await page.evaluate(() => {
    localStorage.setItem('seedance_presets_v1', JSON.stringify([{ name: '<img src=x onerror="window.__xss=1">위험', axes: {} }]));
  });
  await page.click('#presetBtn');
  await expect(page.locator('#presetList .pi-name')).toHaveText('<img src=x onerror="window.__xss=1">위험');
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
});
