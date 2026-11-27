import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
export const Pill = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 48, fontColor = "rgba(255,255,255,0.5)", pillColor = "#6366F1", pillTextColor = "#FFFFFF", pillPadding = 12, position = "bottom", maxWidth, emphasisStyle, emphasisColor, }) => {
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
                gap: "6px 10px",
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: segment.words.map((word, i) => {
                const isActive = i === activeWordIndex;
                const isPast = i < activeWordIndex;
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor: pillColor });
                const scale = (isActive
                    ? spring({ frame, fps, config: { damping: 10, stiffness: 200 } })
                    : 1) * emph.scaleBoost;
                return (_jsx("span", { style: {
                        fontFamily,
                        fontSize,
                        fontWeight: 600,
                        color: emph.color
                            ? emph.color
                            : isActive
                                ? pillTextColor
                                : isPast
                                    ? "white"
                                    : fontColor,
                        display: "inline-block",
                        padding: isActive ? `4px ${pillPadding}px` : "4px 2px",
                        backgroundColor: isActive ? pillColor : "transparent",
                        borderRadius: isActive ? "999px" : "0",
                        transform: `scale(${scale})`,
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? "none"
                                : "0 2px 8px rgba(0,0,0,0.5)",
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Pill.js.map