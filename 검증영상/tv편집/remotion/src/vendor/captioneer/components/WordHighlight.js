import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, } from "remotion";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
import { emphasisVisual } from "./emphasis.js";
import { captionBoxMaxWidth, flatWordIndex, resolveDisplayLines, } from "./style-props.js";
export const WordHighlight = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.5)", highlightColor = "#FFD700", position = "bottom", maxWidth, wordsPerLine, useSmartWrap, emphasisStyle, emphasisColor, }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;
    const segment = getActiveSegment(captions, currentTimeMs);
    if (!segment)
        return null;
    const activeWordIndex = getActiveWordIndex(segment, currentTimeMs);
    const lines = resolveDisplayLines(segment, {
        maxWidth,
        wordsPerLine,
        useSmartWrap,
    });
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
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: lines.map((line, lineIdx) => (_jsx("div", { style: {
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "8px 12px",
                }, children: line.map((word, wi) => {
                    const i = flatWordIndex(lines, lineIdx, wi);
                    const isActive = i === activeWordIndex;
                    const isPast = i < activeWordIndex;
                    const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor });
                    const scale = (isActive
                        ? spring({
                            frame,
                            fps,
                            config: { damping: 10, stiffness: 200 },
                        })
                        : 1) * emph.scaleBoost;
                    return (_jsx("span", { style: {
                            fontFamily,
                            fontSize,
                            fontWeight: 700,
                            color: emph.color
                                ? emph.color
                                : isActive
                                    ? highlightColor
                                    : isPast
                                        ? "white"
                                        : fontColor,
                            transform: `scale(${scale})`,
                            textShadow: emph.textShadow
                                ? emph.textShadow
                                : isActive
                                    ? `0 0 20px ${highlightColor}80`
                                    : "0 2px 8px rgba(0,0,0,0.5)",
                            display: "inline-block",
                        }, children: word.word }, `${word.startMs}-${i}`));
                }) }, lineIdx))) }) }));
};
//# sourceMappingURL=WordHighlight.js.map