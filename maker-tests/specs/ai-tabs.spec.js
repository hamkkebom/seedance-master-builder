import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { openMaker } from './helpers.js';

/* 앞 0.5초 무음 + 1.5초 소리(220Hz)가 든 2초짜리 WebM — CI 브라우저도 풀 수 있는 형식 */
const VOICE_FIXTURE = new URL('../fixtures/voice-sample.webm', import.meta.url);

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

test('영상 업그레이드 · 목소리 음색 유지: A에서 목소리 WAV를 뽑고, B를 참조 영상(음성 1)으로 구성 요청한다', async ({ page }) => {
  await openMaker(page);
  await page.route('https://generativelanguage.googleapis.com/**', async route => {
    const isPlan = (route.request().postData() || '').includes('광고주 피드백');
    await route.fulfill(isPlan
      ? geminiReply({ changes: [{ feedback: '더 자연스럽게, 카메라 움직임', change: '컷마다 느린 푸시인·옆으로 이동' }], plan: { subject: '한복 입은 상담사', cuts: Array.from({ length: 4 }, (_, i) => ({ scene: `장면 ${i + 1}`, dialog: i === 0 ? '안녕하세요, 용신당입니다.' : '', narration: false, camera: '느린 푸시인' })) }, voiceNote: '음성 1(A 목소리)의 음색 그대로, 차분하게', musicNote: '잔잔한 국악', editNotes: [] })
      : geminiReply({ seconds: 2, format: 'dialog', summary: '상담사 소개', cuts: [{ start: 0, end: 2, scene: '굿당 앞 상담사', camera: '고정 미디엄', speech: '안녕하세요', speaker: '상담사', sound: '' }] }));
  });
  let composerBody = '';
  await page.route('https://api.deepseek.com/**', async route => {
    composerBody = route.request().postData() || '';
    await route.fulfill({ status: 503, body: 'busy' });
  });

  await page.click('#aiTabUpgrade');
  await page.fill('#upGeminiKey', FAKE_GEMINI_KEY);
  await page.setInputFiles('#upFile', { name: 'voice-sample.webm', mimeType: 'video/webm', buffer: readFileSync(VOICE_FIXTURE) });
  await page.fill('#upFeedback', '더 자연스럽게, 카메라 움직임');
  await page.check('#upKeepVoice');
  await page.click('#upAnalyzeBtn');
  await expect(page.locator('#upAnalysis')).toHaveValue(/안녕하세요/);
  await page.fill('#aiApiKey', FAKE_DS_KEY);
  await page.click('#upBuildBtn');
  await expect(page.locator('#aiStatus')).toHaveAttribute('data-state', 'error');   // DeepSeek는 가짜로 실패시킴

  /* 목소리 파일: 앞 무음을 건너뛰어 약 0.4초부터, 1.5초 남짓, 올바른 WAV */
  const link = page.locator('#upVoiceDownload');
  await expect(link).toHaveAttribute('download', '음성1_A목소리.wav');
  await expect(page.locator('#upResult')).toContainText('음성 1로 올립니다');
  const wav = await page.evaluate(async href => {
    const bytes = new Uint8Array(await (await fetch(href)).arrayBuffer());
    const view = new DataView(bytes.buffer);
    return { riff: String.fromCharCode(...bytes.slice(0, 4)), wave: String.fromCharCode(...bytes.slice(8, 12)), channels: view.getUint16(22, true), rate: view.getUint32(24, true), dataBytes: view.getUint32(40, true) };
  }, await link.getAttribute('href'));
  expect(wav.riff).toBe('RIFF');
  expect(wav.wave).toBe('WAVE');
  expect(wav.channels).toBe(1);
  const seconds = wav.dataBytes / 2 / wav.rate;
  expect(seconds).toBeGreaterThan(1.3);
  expect(seconds).toBeLessThan(1.8);

  /* DeepSeek 구성 요청은 참조 영상(r2v) + 음성 참조로 간다 */
  expect(composerBody).toContain('r2v');
  expect(composerBody).toContain('audiovoice');
  expect(composerBody).toContain('음성 1');
  await expectUnlocked(page);
});
