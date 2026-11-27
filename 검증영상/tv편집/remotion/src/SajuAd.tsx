// 사주천궁 "내 결혼운" 유튜브 쇼츠 광고 — 효과자막·모션그래픽 레이어.
// 바탕 영상(base_video.mp4: 색보정·줌·플래시·엔드카드 배경 포함)과 최종 소리(base_audio.m4a)는 ffmpeg에서 미리 만든다.
// 좌표는 720x1280 기준. 유튜브 쇼츠 안전 영역: 위 192 / 아래 448 / 오른쪽 128 비움 → 글자는 y 192~832, 가운데 x 360, 폭 464 이하.
import React from 'react';
import {TikTokOfficial, CaptioneerTikTokPreset, CaptioneerShortsPreset, SubtitleBounce} from './CaptionVariants';
export type Mode = 'custom' | 'tiktok' | 'cap-tiktok' | 'cap-shorts' | 'sub-bounce' | 'tiktok-all';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';

export const FPS = 24;
export const TOTAL_FRAMES = 625; // 26.04초
const s = (sec: number) => Math.round(sec * FPS);

// 브랜드 색 (46saju.com CSS)
export const C = {
  purple: '#9377A1', deep: '#5E4A77', lav: '#C2AACD', lavText: '#DCC8EC', coral: '#FE6169', rose: '#B92D62', ink: '#2E1F3E',
};

export const fontCss = `
@font-face { font-family: 'NanumNeo'; src: url('${staticFile('fonts/NanumSquareNeoOTF-Eb.otf')}'); }
@font-face { font-family: 'GyeonggiTitle'; src: url('${staticFile('fonts/GyeonggiTitle-Bold.ttf')}'); }
@font-face { font-family: 'PretendardBlack'; src: url('${staticFile('fonts/Pretendard-Black.otf')}'); }
@font-face { font-family: 'PretendardP'; font-weight: 100 900; src: url('${staticFile('fonts/Pretendard-ExtraBold.otf')}'); }
@font-face { font-family: 'D2Coding'; src: url('${staticFile('fonts/D2CodingBold.ttf')}'); }
@font-face { font-family: 'PretendardXB'; src: url('${staticFile('fonts/Pretendard-ExtraBold.otf')}'); }
`;

// 글자 테두리(8방향) + 아래 그림자
const outline = (color: string, w: number, shadow = 'rgba(0,0,0,0.45)') => {
  const d: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    d.push(`${(Math.cos(a) * w).toFixed(1)}px ${(Math.sin(a) * w).toFixed(1)}px 0 ${color}`);
  }
  d.push(`0 ${w + 3}px ${w + 4}px ${shadow}`);
  return d.join(',');
};

// ── 대사 자막: 조각별로 튀어나오며, 강조어는 더 크게 튕긴다
type Part = {text: string; color?: string; emph?: boolean; at?: number};
const Caption: React.FC<{parts: Part[]; dur: number}> = ({parts, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [dur - 4, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 0, width: 720, top: 822 - 62, height: 62, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', opacity: out}}>
      <div style={{maxWidth: 464, whiteSpace: 'nowrap', fontFamily: 'NanumNeo', fontSize: 44, lineHeight: '62px', color: 'white', textShadow: outline(C.ink, 4.5)}}>
        {parts.map((p, i) => {
          const st = s(p.at ?? 0);
          const sp = spring({frame: f - st, fps, config: p.emph ? {damping: 9, stiffness: 220, mass: 0.6} : {damping: 16, stiffness: 260, mass: 0.5}});
          const scale = p.emph ? interpolate(sp, [0, 1], [1.7, 1]) : interpolate(sp, [0, 1], [0.7, 1]);
          const y = interpolate(sp, [0, 1], [p.emph ? 0 : 18, 0]);
          return (
            <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', color: p.color ?? 'white', opacity: f >= st ? Math.min(1, sp * 1.6) : 0, transform: `translateY(${y}px) scale(${scale})`, transformOrigin: '50% 80%'}}>
              {p.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── 결사반대!: 도장처럼 쾅 + 충격파 링
const Stamp: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = spring({frame: f, fps, config: {damping: 7, stiffness: 300, mass: 0.7}});
  const scale = interpolate(sp, [0, 1], [2.6, 1]);
  const ring = interpolate(f, [2, 14], [0.4, 1.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ringOp = interpolate(f, [2, 14], [0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const out = interpolate(f, [dur - 4, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', left: 360 - 150, top: 242 - 150, width: 300, height: 300, borderRadius: '50%', border: `10px solid ${C.coral}`, transform: `scale(${ring})`, opacity: ringOp}} />
      <div style={{position: 'absolute', left: 0, width: 720, top: 242 - 55, textAlign: 'center', fontFamily: 'PretendardBlack', fontSize: 88, lineHeight: '110px', color: 'white', letterSpacing: -2, textShadow: outline(C.rose, 6, 'rgba(80,0,20,0.5)'), transform: `scale(${scale}) rotate(${interpolate(sp, [0, 1], [-14, -4])}deg)`, opacity: Math.min(1, sp * 2)}}>
        결사반대!
      </div>
    </AbsoluteFill>
  );
};

// ── 따르릉: 벨 박자에 맞춰 흔들리고 양옆에 진동선
const Ring: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = spring({frame: f, fps, config: {damping: 12, stiffness: 240}});
  const t = f / fps;
  const burst = (t > 0.1 && t < 0.85) || (t > 1.3 && t < 2.05);
  const rot = burst ? Math.sin(t * 50) * 11 : 0;
  const pulse = burst ? 1 + Math.abs(Math.sin(t * 25)) * 0.06 : 1;
  const out = interpolate(f, [dur - 4, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const waves = [0, 1, 2].map((i) => {
    const ph = ((t * 3 + i / 3) % 1);
    return {op: burst ? 1 - ph : 0, off: 10 + ph * 26};
  });
  return (
    <div style={{position: 'absolute', left: 420 - 160, top: 280 - 60, width: 320, height: 120, opacity: out * Math.min(1, sp * 1.5), transform: `scale(${interpolate(sp, [0, 1], [1.5, 1]) * pulse}) rotate(${rot}deg)`}}>
      <svg width={320} height={120} style={{position: 'absolute', left: 0, top: 0}}>
        {waves.map((w, i) => (
          <g key={i} opacity={w.op} stroke={C.lav} strokeWidth={6} fill="none" strokeLinecap="round">
            <path d={`M ${55 - w.off} 35 Q ${40 - w.off} 60 ${55 - w.off} 85`} />
            <path d={`M ${265 + w.off} 35 Q ${280 + w.off} 60 ${265 + w.off} 85`} />
          </g>
        ))}
      </svg>
      <div style={{position: 'absolute', inset: 0, textAlign: 'center', fontFamily: 'PretendardBlack', fontSize: 78, lineHeight: '120px', color: 'white', textShadow: outline(C.deep, 5)}}>따르릉</div>
    </div>
  );
};

// ── 반짝이 별
export const Star: React.FC<{x: number; y: number; size: number; delay: number; color?: string; loop?: boolean}> = ({x, y, size, delay, color = '#FFF4FA', loop}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ff = f - delay;
  if (ff < 0) return null;
  const sp = spring({frame: ff, fps, config: {damping: 8, stiffness: 200}});
  const tw = loop ? 0.6 + 0.4 * Math.abs(Math.sin(ff / 7)) : 1;
  const sc = sp * tw;
  return (
    <svg width={size * 2} height={size * 2} style={{position: 'absolute', left: x - size, top: y - size, transform: `scale(${sc}) rotate(${ff * 3}deg)`, filter: `drop-shadow(0 0 ${size / 3}px ${C.lav})`}}>
      <path d={`M ${size} 0 Q ${size * 1.08} ${size * 0.92} ${size * 2} ${size} Q ${size * 1.08} ${size * 1.08} ${size} ${size * 2} Q ${size * 0.92} ${size * 1.08} 0 ${size} Q ${size * 0.92} ${size * 0.92} ${size} 0 Z`} fill={color} />
    </svg>
  );
};

// ── OK!: 튕기며 등장 + 방사형 선
const OkPop: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = spring({frame: f, fps, config: {damping: 6, stiffness: 260, mass: 0.6}});
  const rays = interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const rayOp = interpolate(f, [0, 4, 12], [0, 1, 0], {extrapolateRight: 'clamp'});
  const out = interpolate(f, [dur - 4, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cx = 170, cy = 300;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <svg width={720} height={1280} style={{position: 'absolute'}}>
        {Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const r1 = 70 + rays * 30, r2 = 90 + rays * 60;
          return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} stroke={C.lav} strokeWidth={7} strokeLinecap="round" opacity={rayOp} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: cx - 150, top: cy - 65, width: 300, textAlign: 'center', fontFamily: 'PretendardBlack', fontSize: 104, lineHeight: '130px', color: C.lavText, textShadow: outline(C.deep, 6), transform: `scale(${interpolate(sp, [0, 1], [2.2, 1])}) rotate(8deg)`, opacity: Math.min(1, sp * 2)}}>OK!</div>
    </AbsoluteFill>
  );
};

// ── 로고 + 빛이 쓸고 지나가는 효과
export const Logo: React.FC<{src: string; cx: number; cy: number; width: number; from?: number; shineAt: number}> = ({src, cx, cy, width, from = 1.3, shineAt}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = spring({frame: f, fps, config: {damping: 11, stiffness: 160}});
  const sc = interpolate(sp, [0, 1], [from, 1]);
  const h = (width * 410) / 865;
  const sweep = interpolate(f, [shineAt, shineAt + 14], [-0.6, 1.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const url = staticFile(src);
  return (
    <div style={{position: 'absolute', left: cx - width / 2, top: cy - h / 2, width, height: h, transform: `scale(${sc})`, opacity: Math.min(1, sp * 1.8)}}>
      <Img src={url} style={{width, height: h}} />
      <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${url})`, WebkitMaskSize: '100% 100%', maskImage: `url(${url})`, maskSize: '100% 100%',
        background: `linear-gradient(105deg, transparent ${(sweep - 0.25) * 100}%, rgba(255,255,255,0.85) ${sweep * 100}%, transparent ${(sweep + 0.25) * 100}%)`}} />
    </div>
  );
};

// ── 엔드카드
export const EndCard: React.FC<{tt?: boolean; cta?: string; logoDelay?: number}> = ({tt, cta = '앱에서 궁합 보기', logoDelay = 4}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fadeIn = (st: number, d = 8) => interpolate(f, [st, st + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const rot = f * 0.9;
  const ctaSp = spring({frame: f - 20, fps, config: {damping: 10, stiffness: 180}});
  const pulse = f > 30 ? 1 + 0.045 * Math.sin((f - 30) / 3.2) : 1;
  const shine = ((f - 26) % 30) / 30;
  const petals = Array.from({length: 14}).map((_, i) => {
    const x0 = random(`px${i}`) * 720, sp0 = 1.2 + random(`ps${i}`) * 1.6, sz = 10 + random(`sz${i}`) * 12, ph = random(`ph${i}`) * 6;
    const y = -40 + ((f * sp0 * 2.4 + random(`py${i}`) * 1300) % 1340);
    const x = x0 + Math.sin(f / 14 + ph) * 26;
    return {x, y, sz, r: f * 3 + ph * 60, op: 0.55 + random(`po${i}`) * 0.35};
  });
  return (
    <AbsoluteFill>
      {petals.map((p, i) => (
        <div key={i} style={{position: 'absolute', left: p.x, top: p.y, width: p.sz, height: p.sz * 0.7, borderRadius: '60% 0 60% 0', background: 'linear-gradient(135deg,#fde4f2,#d9b8e6)', opacity: p.op * fadeIn(0, 10), transform: `rotate(${p.r}deg)`}} />
      ))}
      <svg width={720} height={1280} style={{position: 'absolute', opacity: fadeIn(2, 10)}}>
        <g transform={`rotate(${rot} 360 565)`}><circle cx={360} cy={565} r={222} fill="none" stroke={C.purple} strokeWidth={3} strokeDasharray="520 80" /></g>
        <g transform={`rotate(${-rot * 0.7} 360 565)`}><circle cx={360} cy={565} r={238} fill="none" stroke={C.lav} strokeWidth={1.5} strokeDasharray="6 10" /></g>
      </svg>
      <Sequence from={logoDelay} layout="none"><Logo src="logo_black.png" cx={360} cy={565} width={430} from={0.4} shineAt={14} /></Sequence>
      {false ? null : <div style={{position: 'absolute', top: 690, width: 720, textAlign: 'center', fontFamily: 'PretendardXB', fontSize: 26, letterSpacing: 4, color: C.purple, opacity: fadeIn(12)}}>궁합 · 사주 · 운세</div>}
      <div style={{position: 'absolute', top: 745, width: 720, display: 'flex', justifyContent: 'center', opacity: Math.min(1, ctaSp * 2)}}>
        <div style={{position: 'relative', overflow: 'hidden', padding: '14px 40px', borderRadius: 40, background: `linear-gradient(135deg, ${C.purple}, ${C.deep})`, boxShadow: '0 8px 20px rgba(60,30,90,0.35)', fontFamily: 'NanumNeo', fontSize: 38, color: 'white', transform: `scale(${interpolate(ctaSp, [0, 1], [0.6, 1]) * pulse})`}}>
          {cta}
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 60, left: `${-20 + shine * 140}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)', transform: 'skewX(-20deg)'}} />
        </div>
      </div>
      <Star x={150} y={480} size={16} delay={8} loop />
      <Star x={575} y={460} size={20} delay={12} loop />
      <Star x={560} y={670} size={13} delay={16} loop />
    </AbsoluteFill>
  );
};


// ── 공식 template-tiktok 글자 스타일(원본 Page.tsx 값: 흰 글씨 + 검은 20px 테두리(1080 기준) + 강조 초록 #39E508,
//    5프레임 스프링으로 0.8배→1배·50px 아래에서 올라오며 등장)을 강조 문구·엔드카드 문구에도 똑같이 쓴다.
const TT_K = 720 / 1080;
const TT_GREEN = '#39E508';
const TTText: React.FC<{x?: number; y: number; size: number; children: React.ReactNode; color?: string; rotate?: number; shake?: (t: number) => number; dur?: number; delay?: number}> = ({x = 360, y, size, children, color = 'white', rotate = 0, shake, dur, delay = 0}) => {
  const f = useCurrentFrame() - delay;
  const {fps} = useVideoConfig();
  if (f < 0) return null;
  const enter = spring({frame: f, fps, config: {damping: 200}, durationInFrames: 5});
  const out = dur ? interpolate(f, [dur - delay - 3, dur - delay], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const rot = rotate + (shake ? shake(f / fps) : 0);
  return (
    <div style={{position: 'absolute', left: x - 360, top: y - size * 0.6, width: 720, textAlign: 'center', fontFamily: 'PretendardBlack', fontSize: size, lineHeight: 1.2, color,
      WebkitTextStroke: `${20 * TT_K}px black`, paintOrder: 'stroke', opacity: out,
      transform: `scale(${interpolate(enter, [0, 1], [0.8, 1])}) translateY(${interpolate(enter, [0, 1], [50 * TT_K, 0])}px) rotate(${rot}deg)`}}>
      {children}
    </div>
  );
};
const ringShake = (t: number) => ((t > 0.1 && t < 0.85) || (t > 1.3 && t < 2.05) ? Math.sin(t * 50) * 9 : 0);

// ── 효과자막(말이 아닌 글자) 전용 스타일 — 말하는 자막(공식 TikTok: Pretendard 흰 글씨+검은 테두리+초록)과 일부러 완전히 다르게.
//    예능식: 다른 글꼴(경기천년제목), 색 채움 + 흰 안쪽 테두리 + 진보라 바깥 테두리 2겹 + 그림자, 기울기, 튕기며 등장, 주변 그래픽(링·진동선·방사선).
export const FxText: React.FC<{x: number; y: number; size: number; fill: string; children: React.ReactNode; rotate?: number; shake?: (t: number) => number; dur: number; from?: number}> = ({x, y, size, fill, children, rotate = 0, shake, dur, from = 2.2}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = spring({frame: f, fps, config: {damping: 7, stiffness: 280, mass: 0.7}});
  const out = interpolate(f, [dur - 4, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rot = rotate + (shake ? shake(f / fps) : 0) + interpolate(sp, [0, 1], [-10, 0]);
  const base: React.CSSProperties = {position: 'absolute', inset: 0, textAlign: 'center', fontFamily: 'GyeonggiTitle', fontSize: size, lineHeight: `${size * 1.3}px`, whiteSpace: 'nowrap', paintOrder: 'stroke'};
  return (
    <div style={{position: 'absolute', left: x - 360, top: y - size * 0.65, width: 720, height: size * 1.3, opacity: out * Math.min(1, sp * 2), transform: `scale(${interpolate(sp, [0, 1], [from, 1])}) rotate(${rot}deg)`}}>
      <div style={{...base, color: C.ink, WebkitTextStroke: `${size * 0.36}px ${C.ink}`, transform: 'translate(3px, 6px)', filter: 'blur(0.5px)'}}>{children}</div>
      <div style={{...base, color: fill, WebkitTextStroke: `${size * 0.2}px white`}}>{children}</div>
    </div>
  );
};
export const ShockRing: React.FC<{x: number; y: number; color: string}> = ({x, y, color}) => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [2, 14], [0.4, 1.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const op = interpolate(f, [2, 14], [0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{position: 'absolute', left: x - 150, top: y - 150, width: 300, height: 300, borderRadius: '50%', border: `10px solid ${color}`, transform: `scale(${sc})`, opacity: op}} />;
};
export const RingWaves: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const burst = (t > 0.1 && t < 0.85) || (t > 1.3 && t < 2.05);
  return (
    <svg width={420} height={140} style={{position: 'absolute', left: x - 210, top: y - 70}}>
      {[0, 1, 2].map((i) => {
        const ph = (t * 3 + i / 3) % 1;
        const off = 10 + ph * 30;
        return (
          <g key={i} opacity={burst ? 1 - ph : 0} stroke={C.deep} strokeWidth={7} fill="none" strokeLinecap="round">
            <path d={`M ${70 - off} 40 Q ${52 - off} 70 ${70 - off} 100`} />
            <path d={`M ${350 + off} 40 Q ${368 + off} 70 ${350 + off} 100`} />
          </g>
        );
      })}
    </svg>
  );
};
export const BurstRays: React.FC<{x: number; y: number; color: string}> = ({x, y, color}) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const op = interpolate(f, [0, 4, 12], [0, 1, 0], {extrapolateRight: 'clamp'});
  return (
    <svg width={720} height={1280} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 10}).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r1 = 70 + r * 30, r2 = 90 + r * 60;
        return <line key={i} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={x + Math.cos(a) * r2} y2={y + Math.sin(a) * r2} stroke={color} strokeWidth={8} strokeLinecap="round" opacity={op} />;
      })}
    </svg>
  );
};

export const At: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">{children}</Sequence>
);
const Cap: React.FC<{from: number; to: number; parts: Part[]}> = ({from, to, parts}) => (
  <At from={from} to={to}><Caption parts={parts} dur={s(to) - s(from)} /></At>
);

export const SajuAd: React.FC<{mode?: Mode}> = ({mode = 'custom'}) => (
  <AbsoluteFill style={{backgroundColor: 'black'}}>
    <style>{fontCss}</style>
    <OffthreadVideo src={staticFile('base_video.mp4')} muted />
    <Audio src={staticFile('base_audio.m4a')} />

    {/* 대사 자막 */}
    {(mode === 'tiktok' || mode === 'tiktok-all') && <TikTokOfficial />}
    {mode === 'cap-tiktok' && <CaptioneerTikTokPreset />}
    {mode === 'cap-shorts' && <CaptioneerShortsPreset />}
    {mode === 'sub-bounce' && <SubtitleBounce />}
    {mode === 'custom' && (<>
    <Cap from={0.6} to={1.6} parts={[{text: '이 결혼'}]} />
    <Cap from={1.6} to={3.3} parts={[{text: '절대', color: C.coral, emph: true}, {text: ' 허락 못한다!', at: 0.45}]} />
    <Cap from={8.05} to={9.25} parts={[{text: '두 분 궁합은'}]} />
    <Cap from={9.25} to={10.35} parts={[{text: '천생연분', color: C.coral, emph: true}, {text: '입니다!', at: 0.4}]} />
    <Cap from={10.55} to={12.0} parts={[{text: '사주천궁', color: C.lavText, emph: true}, {text: '이 오케이면,', at: 0.55}]} />
    <Cap from={12.0} to={13.55} parts={[{text: '나도 오케이!', emph: true}]} />
    <Cap from={14.45} to={15.6} parts={[{text: '나도 해봤어!', emph: true}]} />
    <Cap from={15.6} to={16.75} parts={[{text: '사주천궁', color: C.lavText, emph: true}, {text: ' 보고', at: 0.5}]} />
    <Cap from={16.75} to={18.0} parts={[{text: '결혼했다!', emph: true}]} />
    <Cap from={19.1} to={23.04} parts={[{text: '궁합이 '}, {text: '궁금하면?', at: 0.45}]} />

    </>)}

    {/* 강조 문구·그래픽 */}
    {mode === 'tiktok-all' ? (<>
      <At from={1.15} to={3.3}><ShockRing x={360} y={250} color={C.coral} /><FxText x={360} y={250} size={80} fill={C.coral} rotate={-5} dur={s(3.3) - s(1.15)}>결사반대!</FxText></At>
      <At from={3.75} to={7.15}><RingWaves x={455} y={765} /><FxText x={455} y={765} size={70} fill={C.lav} shake={ringShake} from={1.5} dur={s(7.15) - s(3.75)}>따르릉</FxText></At>
      <At from={9.2} to={10.35}>
        <Star x={170} y={430} size={18} delay={0} />
        <Star x={540} y={330} size={24} delay={2} />
        <Star x={560} y={700} size={15} delay={4} />
        <Star x={150} y={720} size={12} delay={6} />
      </At>
      <At from={11.95} to={13.55}><BurstRays x={170} y={300} color={C.lav} /><FxText x={170} y={300} size={96} fill='#FFD84D' rotate={8} dur={s(13.55) - s(11.95)}>OK!</FxText></At>
    </>) : (<>
    <At from={1.15} to={3.3}><Stamp dur={s(3.3) - s(1.15)} /></At>
    <At from={3.75} to={7.15}><Ring dur={s(7.15) - s(3.75)} /></At>
    <At from={9.2} to={10.35}>
      <Star x={170} y={430} size={18} delay={0} />
      <Star x={540} y={330} size={24} delay={2} />
      <Star x={560} y={700} size={15} delay={4} />
      <Star x={150} y={720} size={12} delay={6} />
    </At>
    <At from={11.95} to={13.55}><OkPop dur={s(13.55) - s(11.95)} /></At>
    </>)}
    <At from={20.4} to={23.04}><Logo src="logo_black_glow.png" cx={360} cy={300} width={400} shineAt={8} /></At>

    {/* 엔드카드 */}
    <At from={23.04} to={26.04}><EndCard tt={mode === 'tiktok-all'} /></At>
  </AbsoluteFill>
);
