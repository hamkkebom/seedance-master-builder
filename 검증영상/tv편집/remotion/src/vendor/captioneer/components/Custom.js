import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { getActiveSegment, getActiveWordIndex, getWordProgress } from "../utils.js";
import { sampleAnimation } from "../animation.js";
import { emphasisVisual } from "./emphasis.js";
import { captionBoxMaxWidth } from "./style-props.js";
export const Custom = ({ captions, animation, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.5)", highlightColor = "#FFD700", fontWeight = 700, position = "bottom", maxWidth, emphasisStyle, emphasisColor, }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;
    const segment = getActiveSegment(captions, currentTimeMs);
    if (!segment)
        return null;
    const activeWordIndex = getActiveWordIndex(segment, currentTimeMs);
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
                gap: "8px 12px",
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: segment.words.map((word, i) => {
                const isActive = i === activeWordIndex;
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor });
                // Each word runs the keyframes across its own spoken progress;
                // past words hold their final state, future words their first.
                const progress = i < activeWordIndex
                    ? 1
                    : i === activeWordIndex
                        ? getWordProgress(word, currentTimeMs)
                        : 0;
                const state = sampleAnimation(animation, progress);
                const scale = state.scale * emph.scaleBoost;
                return (_jsx("span", { style: {
                        fontFamily,
                        fontSize,
                        fontWeight,
                        color: emph.color ?? state.color ?? fontColor,
                        opacity: state.opacity,
                        display: "inline-block",
                        transform: `translateY(${state.yOffset}px) scale(${scale})`,
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? `0 0 16px ${highlightColor}50`
                                : "0 2px 8px rgba(0,0,0,0.5)",
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Custom.js.map