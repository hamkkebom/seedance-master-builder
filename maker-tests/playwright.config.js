import { defineConfig, devices } from '@playwright/test';

/* 메이커는 빌드 없는 HTML 한 장이라 서버 없이 file:// 로 연다. 외부 API(DeepSeek·Gemini)는 테스트에서 가짜 응답으로 막는다 */
export default defineConfig({
  testDir: './specs',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  /* 스냅샷 파일 이름에 OS를 붙이지 않는다 — 윈도우에서 만든 스냅샷을 리눅스 CI가 그대로 비교 */
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFileName}/{arg}{ext}',
  /* PW_CHANNEL=chrome 이면 PC에 설치된 Chrome으로 돌린다 (playwright 브라우저를 따로 받지 않을 때) */
  use: { ...devices['Desktop Chrome'], locale: 'ko-KR', channel: process.env.PW_CHANNEL || undefined },
  projects: [{ name: 'chromium' }]
});
