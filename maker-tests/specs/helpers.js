import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* MAKER_FILE 환경 변수로 다른 HTML(예: 이전 버전)을 시험할 수 있다 */
export const MAKER_FILE = process.env.MAKER_FILE || join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'seedance-master-builder.html');
export const MAKER_URL = pathToFileURL(MAKER_FILE).href;

/* 페이지 오류·콘솔 오류를 모은다 (외부 글꼴 등 네트워크 실패는 테스트 대상이 아니라 뺀다) */
export function collectErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/Failed to load resource|net::ERR_/i.test(text)) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

/* 외부 요청은 기본으로 모두 막는다 — 테스트가 실제 API를 부르거나 키를 보내는 일이 없게 */
export async function blockNetwork(page) {
  await page.route(/^https?:\/\//, route => route.abort());
}

export async function openMaker(page) {
  await blockNetwork(page);
  await page.goto(MAKER_URL);
  await page.waitForFunction(() => typeof AITabs !== 'undefined' && document.querySelectorAll('#slots > *').length > 0);
}

/* 메이커 HTML을 바꾼 사본을 만들어 그 주소를 돌려준다 (고장 시험용) */
export function writeVariant(testInfo, name, transform) {
  const html = readFileSync(MAKER_FILE, 'utf8');
  const changed = transform(html);
  if (changed === html) throw new Error(`${name}: 바꿀 곳을 찾지 못했습니다`);
  /* 메이커는 상대 경로 파일을 불러오지 않으므로 테스트 결과 폴더에 둬도 같게 동작한다 */
  const dir = testInfo.outputPath('variants');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${name}.html`);
  writeFileSync(file, changed);
  return pathToFileURL(file).href;
}
