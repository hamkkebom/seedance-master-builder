import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
export const Highlighter = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.4)", highlightColor = "#FFEB3B", highlightOpacity = 0.7, position = "bottom", emphasisStyle, emphasisColor, maxWidth, }) => {
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
                gap: "8px 12px",
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: segment.words.map((word, i) => {
                const isActive = i === activeWordIndex;
                const isPast = i < activeWordIndex;
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor });
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
                        backgroundColor: isActive
                            ? `${highlightColor}${Math.round(highlightOpacity * 255).toString(16).padStart(2, "0")}`
                            : "transparent",
                        padding: isActive ? "2px 8px" : "0",
                        borderRadius: "4px",
                        transform: isActive && scale !== 1
                            ? `rotate(-1deg) scale(${scale})`
                            : isActive
                                ? "rotate(-1deg)"
                                : scale !== 1
                                    ? `scale(${scale})`
                                    : "none",
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? "none"
                                : "0 2px 8px rgba(0,0,0,0.5)",
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Highlighter.js.map