// 공개 자막 템플릿을 "각자 대표 스타일 그대로" 쓰는 비교용 레이어.
// B. Remotion 공식 template-tiktok — GitHub 원본 Page.tsx 값 그대로: 흰 글씨 + 검은 20px 테두리(1080 기준) + 말하는 단어 초록(#39E508),
//    1.2초 단위로 단어를 묶어 페이지 전환, 5프레임 스프링으로 0.8배→1배·아래에서 위로 등장. 글꼴 TheBoldFont는 한글이 없어 비슷한 굵은 한글 Pretendard Black.
// C. remotion-captioneer 프리셋 "tiktok" — word-highlight, 글씨 64px(1080 기준), 흐린 흰색 + 말하는 단어 빨강(#FE2C55).
// D. remotion-captioneer 프리셋 "youtube-shorts" — bounce, 58px, 흐린 흰색 + 말하는 단어 빨강(#FF0000)이 튀어오름.
// 글꼴: captioneer 기본 Inter는 한글이 없어, Inter를 바탕으로 만든 한글 글꼴 Pretendard로 대체. 크기는 720폭에 맞게 2/3로 환산.
// 위치만 유튜브 쇼츠 안전 영역(아래 끝 y 822)으로 맞췄다. 나머지 모양은 각 템플릿 기본값 그대로.
import React, {useMemo} from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {fitText} from '@remotion/layout-utils';
import {captioneerData, SEGMENTS} from './captions';
// @ts-ignore — 순수 JS 공개 컴포넌트(MIT)
import {AnimatedCaptions} from './vendor/captioneer/components/AnimatedCaptions.js';
// @ts-ignore
import {applyPreset} from './vendor/captioneer/presets/index.js';

const K = 720 / 1080; // 1080 기준 값을 720 화면으로 환산

// ── B. 공식 template-tiktok (원본 Page.tsx 그대로 옮김)
const DESIRED_FONT_SIZE = 120 * K;
const HIGHLIGHT_COLOR = '#39E508';
const OfficialPage: React.FC<{page: any}> = ({page}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enterProgress = spring({frame, fps, config: {damping: 200}, durationInFrames: 5});
  const timeInMs = (frame / fps) * 1000;
  const fitted = fitText({fontFamily: 'PretendardBlack', text: page.text, withinWidth: 464, textTransform: 'uppercase'});
  const fontSize = Math.min(DESIRED_FONT_SIZE, fitted.fontSize);
  const tr = `scale(${interpolate(enterProgress, [0, 1], [0.8, 1])}) translateY(${interpolate(enterProgress, [0, 1], [50 * K, 0])}px)`;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 1280 - 822}}>
      <div style={{fontSize, color: 'white', WebkitTextStroke: `${20 * K}px black`, paintOrder: 'stroke', transform: tr, fontFamily: 'PretendardBlack', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.15}}>
        <span style={{display: 'inline-block', transform: tr}}>
          {page.tokens.map((t: any, i: number) => {
            const active = t.fromMs - page.startMs <= timeInMs && t.toMs - page.startMs > timeInMs;
            return <span key={`${t.fromMs}-${i}`} style={{display: 'inline', whiteSpace: 'pre', color: active ? HIGHLIGHT_COLOR : 'white'}}>{t.text}</span>;
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const TikTokOfficial: React.FC<{segments?: typeof SEGMENTS}> = ({segments = SEGMENTS}) => {
  const {fps} = useVideoConfig();
  // 자막 끊기: 공식 템플릿의 1.2초 자동 묶기는 "상!/담!", "한/번에"처럼 의미와 상관없이 잘라서 끄고, 덩어리는 사람이 의미 단위로 정한다.
  const pages = useMemo(() => segments.flatMap((sg) => {
    const ps = createTikTokStyleCaptions({
      captions: sg.words.map((w, i) => ({text: (i === 0 ? '' : ' ') + w.word, startMs: w.startMs, endMs: w.endMs, timestampMs: (w.startMs + w.endMs) / 2, confidence: 1})),
      combineTokensWithinMilliseconds: 1e9, // 자동 1.2초 묶기 대신, 의미 단위로 직접 정한 덩어리 하나 = 한 화면
    }).pages;
    return ps.map((p, i) => ({...p, text: p.text.trim(), startMs: i === 0 ? sg.startMs : p.startMs, endMs: i === ps.length - 1 ? sg.endMs : ps[i + 1].startMs}));
  }), [segments]);
  return (
    <AbsoluteFill>
      {pages.map((p, i) => (
        <Sequence key={i} from={Math.round((p.startMs / 1000) * fps)} durationInFrames={Math.max(1, Math.round(((p.endMs - p.startMs) / 1000) * fps))}>
          <OfficialPage page={p} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ── C·D. remotion-captioneer 프리셋 그대로 (위치만 안전 영역)
// AnimatedCaptions는 화면 아래 10%를 띄우고 세로 가운데 정렬 → 이 상자(680~836)의 위 90% 안 가운데에 자막이 놓인다.
const SAFE_BOX: React.CSSProperties = {position: 'absolute', left: 0, top: 680, width: 720, height: 158};
const Preset: React.FC<{name: string}> = ({name}) => {
  const p = applyPreset(name);
  return (
    <div style={SAFE_BOX}>
      <AnimatedCaptions captions={captioneerData} {...p} fontFamily="PretendardP" fontSize={Math.round(p.fontSize * K)} maxWidth={464} />
    </div>
  );
};
export const CaptioneerTikTokPreset: React.FC = () => <Preset name="tiktok" />;
export const CaptioneerShortsPreset: React.FC = () => <Preset name="youtube-shorts" />;

// ── E. remotion-subtitle (MIT, npm 2.0.0) 대표 템플릿 BounceCaption — 원본 기본값 그대로:
//    굵은 흰 글씨 + 흰 빛번짐, 아래에서 통통 튀어 올라왔다가 사라짐(문장 단위). 원본 글꼴 Consolas는 한글이 없어 비슷한 고정폭 한글 글꼴 D2Coding Bold.
//    원본 글자 크기 10vmin(72px)은 쇼츠 안전 영역 폭을 넘어서, 폭 464 안에 들어오게만 줄였다.
// @ts-ignore
import {BounceCaption} from './vendor/remotion-subtitle/index.esm.js';
export const SubtitleBounce: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      {SEGMENTS.map((sg, i) => {
        const text = sg.words.map((w) => w.word).join(' ');
        const size = Math.min(72, Math.floor(464 / (text.length * 0.62)));
        return (
          <Sequence key={i} from={Math.round((sg.startMs / 1000) * fps)} durationInFrames={Math.round(((sg.endMs - sg.startMs) / 1000) * fps)}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 720, height: 822}}>
              <BounceCaption text={text} style={{fontFamily: 'D2Coding', fontSize: size, whiteSpace: 'nowrap'}} />
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
