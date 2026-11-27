import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
export const Wave = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.4)", waveColor = "#00D4FF", waveHeight = 25, waveDelay = 3, position = "bottom", emphasisStyle, emphasisColor, maxWidth, }) => {
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
                alignItems: "baseline",
                gap: "8px 12px",
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: segment.words.map((word, i) => {
                const isActive = i === activeWordIndex;
                const isPast = i < activeWordIndex;
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor: waveColor });
                // Wave: active word at peak, past words trail off
                const distanceFromActive = i - activeWordIndex;
                const waveY = distanceFromActive >= 0 && distanceFromActive <= waveDelay
                    ? -waveHeight * Math.sin((distanceFromActive / waveDelay) * Math.PI)
                    : isPast
                        ? -5
                        : 0;
                const scale = emph.scaleBoost;
                return (_jsx("span", { style: {
                        fontFamily,
                        fontSize,
                        fontWeight: 700,
                        color: emph.color
                            ? emph.color
                            : isActive
                                ? waveColor
                                : isPast
                                    ? "white"
                                    : fontColor,
                        display: "inline-block",
                        transform: scale !== 1
                            ? `translateY(${waveY}px) scale(${scale})`
                            : `translateY(${waveY}px)`,
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? `0 0 15px ${waveColor}60`
                                : "0 2px 8px rgba(0,0,0,0.5)",
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Wave.js.map