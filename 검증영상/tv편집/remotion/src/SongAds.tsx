// 콕콕상담·오름(결혼운) 노래 광고 편집 — 한결 최종본과 같은 규칙:
//  · 말하는/노래하는 자막 = Remotion 공식 template-tiktok 스타일(흰 글씨+검은 테두리, 지금 부르는 단어 초록)
//  · 효과자막 = 예능식 FxText(경기천년제목, 색 채움+흰·진보라 2겹 테두리, 튕기며 등장) — 말하는 자막과 완전히 다르게
//  · 끝 3초 = 사주천궁 공식 로고 + 자연 배경 엔드카드
// 단어 타이밍은 각 영상 소리를 faster-whisper(small, ko, 단어 단위)로 뽑았고, 자막 글자는 의도한 가사로 적었다.
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, staticFile} from 'remotion';
import {TikTokOfficial} from './CaptionVariants';
import {At, C, EndCard, FxText, fontCss, Star} from './SajuAd';
import type {Seg} from './captions';

const FPS = 24;
const s = (sec: number) => Math.round(sec * FPS);
const w = (word: string, a: number, b: number) => ({word, startMs: Math.round(a * 1000), endMs: Math.round(b * 1000)});
const seg = (a: number, b: number, words: ReturnType<typeof w>[]): Seg => ({startMs: Math.round(a * 1000), endMs: Math.round(b * 1000), words});

// ── 콕콕상담
const KOK_SEG: Seg[] = [
  // 타이밍: 공식 template-tiktok 방식 그대로 — 음성 인식(Whisper)이 준 단어별 시작·끝 시간을 손대지 않고 쓴다.
  // 자막 덩어리만 의미 단위로 나눴다. 마지막 "콕콕상담에서 시작해"는 화면 네온 글자와 겹쳐 뺐다.
  seg(0.05, 2.5, [w('면접,', 0.05, 1.4), w('사업,', 1.42, 2.4)]),
  seg(2.6, 4.0, [w('중요한', 2.68, 3.02), w('일로', 3.02, 3.98)]),
  seg(4.0, 5.38, [w('걱정일', 4.0, 5.16), w('땐', 5.16, 5.36)]),
  seg(5.38, 6.34, [w('오늘운세', 5.38, 6.32)]),
  seg(6.34, 8.2, [w('콕!', 6.34, 6.75), w('콕!', 6.75, 7.15), w('상!', 7.15, 7.55), w('담!', 7.55, 8.1)]),
  seg(8.3, 10.2, [w('이사,', 8.34, 8.82), w('계약,', 9.32, 9.74)]),
  seg(10.3, 11.68, [w('중요한', 10.3, 10.62), w('일로', 10.62, 11.66)]),
  seg(11.68, 13.06, [w('고민일', 11.68, 12.82), w('땐', 12.82, 13.04)]),
  seg(13.06, 14.0, [w('오늘운세', 13.06, 13.98)]),
  seg(14.0, 15.7, [w('콕!', 14.0, 14.4), w('콕!', 14.4, 14.8), w('상!', 14.8, 15.2), w('담!', 15.2, 15.6)]),
  seg(16.0, 17.6, [w('부담', 16.0, 16.42), w('없이', 16.42, 16.82), w('물어보고', 16.82, 17.6)]),
  seg(17.6, 19.56, [w('기부까지', 17.68, 18.64), w('한', 18.64, 19.04), w('번에', 19.04, 19.54)]),
  seg(19.56, 21.4, [w('고민', 19.56, 20.08), w('해결', 20.08, 20.62), w('콕!', 20.62, 21.2)]),
  seg(21.5, 23.4, [w('좋은', 21.54, 22.0), w('일도', 22.0, 22.5), w('콕!', 22.5, 23.2)]),
  seg(23.5, 25.74, [w('중요한', 23.52, 24.08), w('고민', 24.08, 24.8), w('해결엔', 24.8, 25.72)]),
  seg(25.74, 26.72, [w('오늘운세', 25.74, 26.7)]),
];
const KOK_FX: {from: number; to: number; x: number; y: number; size: number; fill: string; rot: number; text: string}[] = [
  {from: 0.3, to: 3.9, x: 360, y: 240, size: 64, fill: C.coral, rot: -4, text: '카드값 폭탄…'},
  {from: 4.3, to: 8.1, x: 360, y: 250, size: 64, fill: C.lav, rot: 4, text: '한숨만 푹…'},
  {from: 8.5, to: 11.9, x: 360, y: 250, size: 62, fill: '#FFD84D', rot: -4, text: '대출 계약서?!'},
  {from: 12.3, to: 15.6, x: 230, y: 250, size: 62, fill: C.lav, rot: -5, text: '1:1 상담 중'},
  {from: 16.0, to: 19.6, x: 200, y: 600, size: 60, fill: C.coral, rot: 4, text: '상담이 기부로 ♥'},
  {from: 20.0, to: 22.9, x: 150, y: 330, size: 70, fill: '#FFD84D', rot: -5, text: '속이 뻥!'},
  {from: 23.3, to: 26.8, x: 210, y: 600, size: 62, fill: C.coral, rot: 4, text: '계약 성공!'},
];

// ── 오름(결혼운)
const ORUM_SEG: Seg[] = [
  seg(0.0, 2.6, [w('너,', 0.05, 0.72), w('결혼', 0.72, 1.88), w('안', 1.88, 2.08), w('하니?', 2.08, 2.55)]),
  seg(3.0, 4.82, [w('고모,', 3.24, 4.12), w('이모,', 4.12, 4.3), w('삼촌들', 4.3, 4.8)]),
  seg(4.82, 5.95, [w('질문은', 4.82, 5.42), w('사절!', 5.42, 5.9)]),
  seg(6.2, 7.6, [w('답', 6.44, 6.74), w('대신', 6.74, 6.98), w('보여줄게', 6.98, 7.58)]),
  seg(7.6, 8.75, [w('내', 7.6, 7.96), w('결혼운', 7.96, 8.7)]),
  seg(8.8, 11.8, [w('저', 8.92, 9.18), w('올해는', 9.18, 10.12), w('갑니다!', 10.12, 11.2)]),
  seg(11.9, 14.8, [w('내', 11.92, 12.18), w('찰떡', 12.18, 13.28), w('결혼운,', 13.28, 14.46)]),
  seg(14.8, 15.9, [w('봄바람', 14.88, 15.4), w('탈지,', 15.4, 15.9)]),
  seg(15.9, 17.2, [w('단풍', 15.9, 16.5), w('질지', 16.5, 17.1)]),
  seg(17.4, 18.94, [w('다', 17.58, 17.9), w('알고', 17.9, 18.28), w('나니', 18.28, 18.92)]),
  seg(18.94, 20.4, [w('세상이', 18.94, 19.68), w('편해,', 19.68, 20.32)]),
  seg(20.4, 21.9, [w('잔소리는', 20.5, 21.36), w('끝!', 21.36, 21.85)]),
  seg(22.0, 24.0, [w('내', 22.22, 22.38), w('결혼은', 22.38, 23.24), w('곧!', 23.24, 23.9)]),
  seg(24.3, 25.75, [w('너도', 24.4, 24.66), w('결혼', 24.66, 24.92), w('운세', 24.92, 25.16), w('궁금해?', 25.16, 25.7)]),
  seg(25.75, 26.92, [w('지금', 25.84, 26.0), w('바로', 26.0, 26.32), w('확인해!', 26.32, 26.92)]),
];
const ORUM_FX: typeof KOK_FX = [
  {from: 0.3, to: 2.6, x: 360, y: 250, size: 64, fill: C.lav, rot: -4, text: '또 시작…'},
  {from: 3.0, to: 5.9, x: 360, y: 250, size: 78, fill: C.coral, rot: 5, text: 'STOP!'},
  {from: 6.3, to: 8.7, x: 140, y: 470, size: 64, fill: '#FFD84D', rot: -5, text: '짜잔!'},
  {from: 9.0, to: 11.8, x: 180, y: 240, size: 58, fill: C.coral, rot: 4, text: '결혼 선언!'},
  {from: 12.0, to: 14.3, x: 200, y: 250, size: 80, fill: '#FFB7D5', rot: -6, text: '봄'},
  {from: 14.5, to: 17.1, x: 520, y: 250, size: 80, fill: '#FF9A3C', rot: 6, text: '가을'},
  {from: 17.4, to: 21.8, x: 360, y: 240, size: 64, fill: C.lav, rot: -4, text: '잔소리 OFF'},
  {from: 22.0, to: 24.2, x: 165, y: 520, size: 56, fill: '#FFB7D5', rot: 5, text: '두근두근'},
];

const SongAd: React.FC<{video: string; audio: string; segs: Seg[]; fx: typeof KOK_FX; endAt: number; cta: string; logoDelay?: number}> = ({video, audio, segs, fx, endAt, cta, logoDelay}) => (
  <AbsoluteFill style={{backgroundColor: 'black'}}>
    <style>{fontCss}</style>
    <OffthreadVideo src={staticFile(video)} muted />
    <Audio src={staticFile(audio)} />
    <TikTokOfficial segments={segs} />
    {fx.map((f, i) => (
      <At key={i} from={f.from} to={f.to}>
        <FxText x={f.x} y={f.y} size={f.size} fill={f.fill} rotate={f.rot} dur={s(f.to) - s(f.from)}>{f.text}</FxText>
      </At>
    ))}
    <At from={endAt} to={endAt + 3}><EndCard tt cta={cta} logoDelay={logoDelay} /></At>
  </AbsoluteFill>
);

export const KokAd: React.FC = () => <SongAd video="kok_video.mp4" audio="kok_audio.m4a" segs={KOK_SEG} fx={KOK_FX} endAt={30.04} cta="앱에서 콕콕상담 하기" />;
export const OrumAd: React.FC = () => <SongAd video="orum_video.mp4" audio="orum_audio.m4a" segs={ORUM_SEG} fx={ORUM_FX} endAt={26.92} cta="앱에서 결혼운 보기" logoDelay={0} />;
export const KOK_FRAMES = 793; // 33.04초
export const ORUM_FRAMES = 718; // 26.92초 + 엔드카드 3초 (끝 정지 구간 잘라냄)
void Star;
