import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { formatSpeakerLabel, speakerColorIndex } from "../providers/diarization.js";
import { WordHighlight } from "./WordHighlight.js";
import { Karaoke } from "./Karaoke.js";
import { Typewriter } from "./Typewriter.js";
import { Bounce } from "./Bounce.js";
import { Wave } from "./Wave.js";
import { Glow } from "./Glow.js";
import { TypewriterErase } from "./TypewriterErase.js";
import { Pill } from "./Pill.js";
import { Flicker } from "./Flicker.js";
import { Highlighter } from "./Highlighter.js";
import { Blur } from "./Blur.js";
import { Rainbow } from "./Rainbow.js";
import { Scale } from "./Scale.js";
import { Spotlight } from "./Spotlight.js";
import { Custom } from "./Custom.js";
const styleMap = {
    "word-highlight": WordHighlight,
    karaoke: Karaoke,
    typewriter: Typewriter,
    bounce: Bounce,
    wave: Wave,
    glow: Glow,
    "typewriter-erase": TypewriterErase,
    pill: Pill,
    flicker: Flicker,
    highlighter: Highlighter,
    blur: Blur,
    rainbow: Rainbow,
    scale: Scale,
    spotlight: Spotlight,
};
const sharedStyleProps = (props) => ({
    captions: props.captions,
    fontFamily: props.fontFamily,
    fontSize: props.fontSize,
    fontColor: props.fontColor,
    highlightColor: props.highlightColor,
    position: props.position,
    maxWidth: props.maxWidth,
    wordsPerLine: props.wordsPerLine,
    useSmartWrap: props.useSmartWrap,
    emphasisStyle: props.emphasisStyle,
    emphasisColor: props.emphasisColor,
});
const DEFAULT_SPEAKER_COLORS = [
    "#3b82f6",
    "#f59e0b",
    "#22c55e",
    "#f472b6",
    "#a78bfa",
    "#34d399",
];
function activeSegment(segments, timeMs) {
    return segments.find((s) => timeMs >= s.startMs && timeMs < s.endMs);
}
const SpeakerLabel = ({ segment, colors }) => {
    if (!segment.speaker)
        return null;
    const idx = speakerColorIndex(segment.speaker, colors.length);
    const color = colors[idx] ?? colors[0];
    return (_jsx("div", { style: {
            position: "absolute",
            top: 24,
            left: 24,
            padding: "6px 12px",
            borderRadius: 8,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "#fff",
            backgroundColor: color,
            opacity: 0.9,
            zIndex: 10,
        }, children: formatSpeakerLabel(segment.speaker) }));
};
export const AnimatedCaptions = (props) => {
    const { style = "word-highlight", highlightColor, backgroundColor, textDirection, showSpeakerLabels = false, speakerColors = DEFAULT_SPEAKER_COLORS, speakerHighlight = false, captions, } = props;
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const timeMs = (frame / fps) * 1000;
    const speakerSeg = showSpeakerLabels || speakerHighlight
        ? activeSegment(captions.segments, timeMs)
        : undefined;
    const currentSeg = showSpeakerLabels ? speakerSeg : undefined;
    // Recolor the animation to the active speaker so multi-speaker clips read
    // like pro captions (each voice pops in its own color).
    const effectiveHighlight = speakerHighlight && speakerSeg?.speaker
        ? speakerColors[speakerColorIndex(speakerSeg.speaker, speakerColors.length)] ?? speakerColors[0]
        : highlightColor;
    const dirStyle = textDirection && textDirection !== "auto"
        ? { direction: textDirection }
        : undefined;
    const fillStyle = {
        ...dirStyle,
        ...(backgroundColor ? { backgroundColor } : {}),
    };
    const childProps = {
        ...sharedStyleProps(props),
        captions,
        highlightColor: effectiveHighlight,
        waveColor: effectiveHighlight,
        glowColor: effectiveHighlight,
        pillColor: effectiveHighlight,
        flickerColor: effectiveHighlight,
        focusColor: effectiveHighlight,
        scaleColor: effectiveHighlight,
        spotlightColor: effectiveHighlight,
        fillColor: effectiveHighlight,
        bounceColor: effectiveHighlight,
        cursorColor: effectiveHighlight,
        eraseColor: "#FF4444",
    };
    // A custom keyframe animation (from a marketplace package or inline)
    // overrides the named style entirely.
    if (props.animation) {
        return (_jsxs(AbsoluteFill, { style: fillStyle, children: [currentSeg && _jsx(SpeakerLabel, { segment: currentSeg, colors: speakerColors }), _jsx(Custom, { ...childProps, animation: props.animation })] }));
    }
    const Component = styleMap[style];
    if (!Component) {
        console.warn(`Unknown caption style: "${style}". Falling back to "word-highlight".`);
        return (_jsx(AbsoluteFill, { style: fillStyle, children: _jsx(WordHighlight, { ...childProps }) }));
    }
    return (_jsxs(AbsoluteFill, { style: fillStyle, children: [currentSeg && _jsx(SpeakerLabel, { segment: currentSeg, colors: speakerColors }), _jsx(Component, { ...childProps })] }));
};
//# sourceMappingURL=AnimatedCaptions.js.map