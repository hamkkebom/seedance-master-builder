import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
export const Scale = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.3)", scaleColor = "#34D399", maxScale = 1.4, position = "bottom", emphasisStyle, emphasisColor, maxWidth, }) => {
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
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor: scaleColor });
                const baseScale = isActive
                    ? spring({
                        frame,
                        fps,
                        config: { damping: 8, stiffness: 150, mass: 0.5 },
                    }) * (maxScale - 1) + 1
                    : isPast
                        ? 1
                        : 0.7;
                // Emphasized idle words rest at full size instead of 0.7.
                const scale = (!isActive && !isPast && word.emphasis && emphasisStyle ? 1 : baseScale) *
                    emph.scaleBoost;
                return (_jsx("span", { style: {
                        fontFamily,
                        fontSize,
                        fontWeight: 700,
                        color: emph.color
                            ? emph.color
                            : isActive
                                ? scaleColor
                                : isPast
                                    ? "white"
                                    : fontColor,
                        display: "inline-block",
                        transform: `scale(${scale})`,
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? `0 0 15px ${scaleColor}60`
                                : "0 2px 8px rgba(0,0,0,0.5)",
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Scale.js.map