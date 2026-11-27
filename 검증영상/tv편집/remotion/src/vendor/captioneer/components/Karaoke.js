import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex, getWordProgress } from "../utils.js";
const KaraokeWord = ({ word, isActive, progress, fontFamily, fontSize, fillColor, baseColor, emphasis }) => {
    const emph = emphasisVisual(word, emphasis);
    const scale = emph.scaleBoost === 1 ? undefined : `scale(${emph.scaleBoost})`;
    if (!isActive) {
        const isPast = progress >= 1;
        return (_jsx("span", { style: {
                fontFamily,
                fontSize,
                fontWeight: 700,
                color: emph.color ?? (isPast ? fillColor : baseColor),
                display: "inline-block",
                textShadow: emph.textShadow ?? "0 2px 8px rgba(0,0,0,0.5)",
                ...(scale ? { transform: scale } : {}),
            }, children: word.word }));
    }
    const fillPercent = Math.round(progress * 100);
    const emphFill = emph.color ?? fillColor;
    // [로컬 수정] background-clip:text 방식은 렌더링(Chrome 헤드리스)에서 글자 대신 색 상자가 찍히는 경우가 있어,
    // 같은 글자를 두 겹 쌓고 위 겹(채움색)을 clip-path로 왼쪽부터 드러내는 방식으로 바꿨다. 보이는 결과는 원본과 같다.
    const common = { fontFamily, fontSize, fontWeight: 700, whiteSpace: "pre" };
    return (_jsxs("span", { style: { position: "relative", display: "inline-block", ...(scale ? { transform: scale } : {}) }, children: [
        _jsx("span", { style: { ...common, color: baseColor, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }, children: word.word }),
        _jsx("span", { style: { ...common, position: "absolute", left: 0, top: 0, color: emphFill, clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }, children: word.word }),
    ] }));
};
export const Karaoke = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fillColor = "#FF6B6B", baseColor = "rgba(255,255,255,0.4)", position = "bottom", maxWidth, emphasisStyle, emphasisColor, }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;
    const segment = getActiveSegment(captions, currentTimeMs);
    if (!segment)
        return null;
    const activeIndex = getActiveWordIndex(segment, currentTimeMs);
    const positionStyle = {
        top: position === "top" ? "10%" : position === "center" ? "50%" : undefined,
        bottom: position === "bottom" ? "10%" : undefined,
        transform: position === "center" ? "translateY(-50%)" : undefined,
    };
    return (_jsx(AbsoluteFill, { style: {
            justifyContent: "center",
            alignItems: "center",
            ...positionStyle,
        }, children: _jsx("div", { style: {
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px 18px",
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: segment.words.map((word, i) => {
                const progress = i < activeIndex ? 1 : i === activeIndex ? getWordProgress(word, currentTimeMs) : 0;
                return (_jsx(KaraokeWord, { word: word, isActive: i === activeIndex, progress: progress, fontFamily: fontFamily, fontSize: fontSize, fillColor: fillColor, baseColor: baseColor, emphasis: { emphasisStyle, emphasisColor, highlightColor: fillColor } }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Karaoke.js.map