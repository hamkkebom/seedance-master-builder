import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
export const Spotlight = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.3)", spotlightColor = "#FBBF24", position = "bottom", emphasisStyle, emphasisColor, maxWidth, }) => {
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
                alignItems: "center",
                gap: "8px 14px",
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: segment.words.map((word, i) => {
                const isActive = i === activeWordIndex;
                const isPast = i < activeWordIndex;
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor: spotlightColor });
                const scale = emph.scaleBoost;
                return (_jsx("span", { style: {
                        fontFamily,
                        fontSize,
                        fontWeight: 700,
                        color: emph.color
                            ? emph.color
                            : isActive
                                ? "#000"
                                : isPast
                                    ? "white"
                                    : fontColor,
                        display: "inline-block",
                        backgroundColor: isActive ? spotlightColor : "transparent",
                        backgroundImage: isActive
                            ? `radial-gradient(ellipse at center, ${spotlightColor} 0%, ${spotlightColor}CC 40%, ${spotlightColor}40 70%, transparent 100%)`
                            : "none",
                        padding: isActive ? "4px 16px" : "0",
                        borderRadius: isActive ? "8px" : "0",
                        transform: scale !== 1 ? `scale(${scale})` : undefined,
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? "none"
                                : "0 2px 8px rgba(0,0,0,0.5)",
                        boxShadow: isActive
                            ? `0 0 30px ${spotlightColor}80, 0 0 60px ${spotlightColor}40`
                            : "none",
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Spotlight.js.map