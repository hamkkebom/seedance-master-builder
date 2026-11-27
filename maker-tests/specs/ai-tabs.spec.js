import { test, expect } from '@playwright/test';
import { openMaker } from './helpers.js';

/* 실제 API는 부르지 않는다 — DeepSeek·Gemini 주소를 가짜 응답으로 바꿔 잠금·오류 처리·키 가림을 확인한다 */
const FAKE_DS_KEY = 'sk-test-0000-fake-key';
const FAKE_GEMINI_KEY = 'AIzaFAKEfakeFAKEfakeFAKEfake0000';

function geminiReply(object) {
  return { status: 200, contentType: 'application/json', body: JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(object) }] } }] }) };
}

async function expectUnlocked(page) {
  for (const id of ['#aiApiKey', '#aiGenerateBtn', '#aiChatSendBtn', '#upAnalyzeBtn']) await expect(page.locator(id)).toBeEnabled();
}

test('한 번에 구성: 실패해도 잠금이 풀리고 오류 메시지에서 키가 가려진다', async ({ page }) => {
  await openMaker(page);
  let locked = null;
  await page.route('https://api.deepseek.com/**', async route => {
    locked = await page.evaluate(() => ({ busy: AITabs.isBusy(), chat: document.getElementById('aiChatSendBtn').disabled, up: document.getElementById('upAnalyzeBtn').disabled }));
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: { message: `bad key ${FAKE_DS_KEY}` } }) });
  });
  await page.fill('#aiApiKey', FAKE_DS_KEY);
  await page.fill('#aiRequest', '비 오는 골목 15초 영상');
  await page.click('#aiGenerateBtn');
  await expect(page.locator('#aiStatus')).toHaveAttribute('data-state', 'error');
  expect(locked).toEqual({ busy: true, chat: true, up: true });   // 호출 중에는 모든 탭이 잠긴다
  await expect(page.locator('#aiStatus')).not.toContainText(FAKE_DS_KEY);
  await expectUnlocked(page);
  expect(await page.evaluate(() => AITabs.isBusy())).toBe(false);
});

test('자유대화: 실패하면 보낸 메시지가 입력칸으로 되돌아오고 잠금이 풀린다', async ({ page }) => {
  await openMaker(page);
  await page.route('https://api.deepseek.com/**', route => route.fulfill({ status: 500, body: 'server error' }));
  await page.fill('#aiApiKey', FAKE_DS_KEY);
  await page.click('#aiTabChat');
  await page.fill('#aiChatInput', '쇼츠 광고를 만들고 싶어');
  await page.click('#aiChatSendBtn');
  await expect(page.locator('#aiStatus')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#aiChatInput')).toHaveValue('쇼츠 광고를 만들고 싶어');
  await expectUnlocked(page);
});

test('영상 업그레이드: A 분석은 키를 헤더로만 보내고, B 적용이 실패해도 대조표가 남고 잠금이 풀린다', async ({ page }) => {
  await openMaker(page);
  const geminiRequests = [];
  await page.route('https://generativelanguage.googleapis.com/**', async route => {
    const request = route.request();
    geminiRequests.push({ url: request.url(), header: request.headers()['x-goog-api-key'], body: request.postData() || '' });
    const isPlan = (request.postData() || '').includes('광고주 피드백');
    await route.fulfill(isPlan
      ? geminiReply({ changes: [{ feedback: '강렬함이 부족', change: '컷 4에 아빠의 강한 대사 추가' }], plan: { subject: '한국 가족', cuts: Array.from({ length: 6 }, (_, i) => ({ scene: `장면 ${i + 1}`, dialog: i === 3 ? '사주천궁이 오케이면, 나도 오케이!' : '', narration: false })) }, voiceNote: '아빠: 굵은 목소리', musicNote: '코믹', editNotes: ['OK! 효과자막'] })
      : geminiReply({ seconds: 17.6, format: 'dialog', summary: '결혼 반대 → 궁합 결과로 허락', cuts: [{ start: 0, end: 4, scene: '거실', camera: '풀샷', speech: '이 결혼 절대 허락 못한다!', speaker: '아빠', sound: '' }] }));
  });
  await page.route('https://api.deepseek.com/**', route => route.fulfill({ status: 503, body: 'busy' }));

  await page.click('#aiTabUpgrade');
  await page.fill('#upGeminiKey', FAKE_GEMINI_KEY);
  await page.setInputFiles('#upFile', { name: 'a.mp4', mimeType: 'video/mp4', buffer: Buffer.from('not really a video') });
  await page.fill('#upFeedback', '강렬함이 부족 / 사주천궁이라면 ok');
  await page.click('#upAnalyzeBtn');
  await expect(page.locator('#upAnalysis')).toHaveValue(/이 결혼 절대 허락 못한다!/);
  expect(geminiRequests[0].header).toBe(FAKE_GEMINI_KEY);
  expect(geminiRequests[0].url).not.toContain(FAKE_GEMINI_KEY);

  await page.fill('#aiApiKey', FAKE_DS_KEY);
  await page.fill('#upSeconds', '23');
  await page.click('#upBuildBtn');
  await expect(page.locator('#aiStatus')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#upResult')).toContainText('컷 4에 아빠의 강한 대사 추가');
  await expect(page.locator('#upResult')).toContainText('사주천궁이 오케이면, 나도 오케이!');
  await expect(page.locator('#aiStatus')).not.toContainText(FAKE_DS_KEY);
  await expectUnlocked(page);
});
