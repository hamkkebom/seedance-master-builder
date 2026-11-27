import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
export const Blur = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.4)", focusColor = "#FFFFFF", blurAmount = 8, position = "bottom", emphasisStyle, emphasisColor, maxWidth, }) => {
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
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor: focusColor });
                const isEmph = Boolean(word.emphasis && emphasisStyle);
                // Emphasized words stay readable instead of resting blurred.
                const blur = isActive || isEmph ? 0 : isPast ? 0 : blurAmount;
                const opacity = isActive ? 1 : isPast || isEmph ? 0.9 : 0.3;
                const scale = emph.scaleBoost;
                return (_jsx("span", { style: {
                        fontFamily,
                        fontSize,
                        fontWeight: 700,
                        color: emph.color
                            ? emph.color
                            : isActive
                                ? focusColor
                                : isPast
                                    ? "white"
                                    : fontColor,
                        display: "inline-block",
                        filter: `blur(${blur}px)`,
                        opacity,
                        transform: scale !== 1 ? `scale(${scale})` : undefined,
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? "0 0 20px rgba(255,255,255,0.3)"
                                : "0 2px 8px rgba(0,0,0,0.5)",
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Blur.js.map