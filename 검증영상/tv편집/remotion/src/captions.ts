// 대사 단어별 타이밍(ms). 분리한 대사 트랙을 faster-whisper(small, ko, word_timestamps)로 뽑고,
// 줄 시작은 소리 크기 측정값으로 보정했다. 자막 줄 나눔은 기존 편집본과 같다.
export type W = {word: string; startMs: number; endMs: number; emphasis?: boolean; color?: 'coral' | 'lav'};
export type Seg = {startMs: number; endMs: number; words: W[]};

export const SEGMENTS: Seg[] = [
  {startMs: 600, endMs: 1600, words: [{word: '이', startMs: 600, endMs: 800}, {word: '결혼', startMs: 800, endMs: 1580}]},
  {startMs: 1600, endMs: 3300, words: [{word: '절대', startMs: 1640, endMs: 2060, emphasis: true, color: 'coral'}, {word: '허락', startMs: 2060, endMs: 2500}, {word: '못한다!', startMs: 2500, endMs: 3280}]},
  {startMs: 8050, endMs: 9250, words: [{word: '두', startMs: 8100, endMs: 8250}, {word: '분', startMs: 8250, endMs: 8400}, {word: '궁합은', startMs: 8400, endMs: 9240}]},
  {startMs: 9250, endMs: 10350, words: [{word: '천생연분입니다!', startMs: 9260, endMs: 10340, emphasis: true, color: 'coral'}]},
  {startMs: 10550, endMs: 12450, words: [{word: '사주천궁이', startMs: 10600, endMs: 11940, emphasis: true, color: 'lav'}, {word: '오케이면,', startMs: 11940, endMs: 12440}]},
  {startMs: 12450, endMs: 13550, words: [{word: '나도', startMs: 12720, endMs: 12980}, {word: '오케이!', startMs: 12980, endMs: 13540, emphasis: true, color: 'coral'}]},
  {startMs: 14400, endMs: 15550, words: [{word: '나도', startMs: 14450, endMs: 14720}, {word: '해봤어!', startMs: 14720, endMs: 15540, emphasis: true, color: 'coral'}]},
  {startMs: 15550, endMs: 18000, words: [{word: '사주천궁', startMs: 15800, endMs: 16460, emphasis: true, color: 'lav'}, {word: '보고', startMs: 16460, endMs: 16770}, {word: '결혼했다!', startMs: 16780, endMs: 17990, emphasis: true, color: 'coral'}]},
  {startMs: 19100, endMs: 20400, words: [{word: '궁합이', startMs: 19100, endMs: 19560}, {word: '궁금하면?', startMs: 19560, endMs: 20390}]},
];

// remotion-captioneer 형식
export const captioneerData = {
  language: 'ko',
  durationMs: 26040,
  segments: SEGMENTS.map((s) => ({
    text: s.words.map((w) => w.word).join(' '),
    startMs: s.startMs,
    endMs: s.endMs,
    words: s.words.map((w) => ({word: w.word, startMs: w.startMs, endMs: w.endMs, confidence: 1, emphasis: !!w.emphasis})),
  })),
};

// @remotion/captions Caption[] 형식 (공식 template-tiktok 방식: 단어 앞에 공백)
export const remotionCaptions = SEGMENTS.flatMap((s) =>
  s.words.map((w, i) => ({text: (i === 0 ? '' : ' ') + w.word, startMs: w.startMs, endMs: w.endMs, timestampMs: (w.startMs + w.endMs) / 2, confidence: 1})),
);
