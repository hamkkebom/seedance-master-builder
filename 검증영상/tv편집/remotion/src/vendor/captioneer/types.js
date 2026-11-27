/**
 * Core types for remotion-captioneer
 *
 * Compatible with @remotion/captions Caption type
 */
// ─── Conversion utilities ──────────────────────────────────────────
/**
 * Convert our CaptionData to flat @remotion/captions Caption array
 */
export function toCaptionArray(captionData) {
    return captionData.segments.flatMap((seg) => seg.words.map((w) => ({
        text: w.word,
        startMs: w.startMs,
        endMs: w.endMs,
        timestampMs: Math.round((w.startMs + w.endMs) / 2),
        confidence: w.confidence,
    })));
}
/**
 * Convert flat @remotion/captions Caption array to our CaptionData
 */
export function fromCaptionArray(captions, language = "en") {
    // Group into segments of ~5 words
    const CHUNK_SIZE = 5;
    const segments = [];
    for (let i = 0; i < captions.length; i += CHUNK_SIZE) {
        const chunk = captions.slice(i, i + CHUNK_SIZE);
        const words = chunk.map((c) => ({
            word: c.text.trim(),
            startMs: c.startMs,
            endMs: c.endMs,
            confidence: c.confidence ?? 1.0,
        }));
        segments.push({
            text: words.map((w) => w.word).join(" "),
            startMs: words[0].startMs,
            endMs: words[words.length - 1].endMs,
            words,
        });
    }
    const durationMs = segments.length > 0 ? segments[segments.length - 1].endMs : 0;
    return { segments, language, durationMs };
}
//# sourceMappingURL=types.js.map