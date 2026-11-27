/**
 * Shared helpers for speaker-aware caption segmentation.
 */
/**
 * Group words into segments, splitting on speaker changes or chunk size.
 */
export function chunkWordsIntoSegments(words, chunkSize = 5) {
    const segments = [];
    let current = [];
    const flush = () => {
        if (current.length === 0)
            return;
        const text = current
            .map((w) => w.word)
            .join(" ")
            .trim();
        if (!text) {
            current = [];
            return;
        }
        const speakers = new Set(current.map((w) => w.speaker).filter((s) => Boolean(s)));
        segments.push({
            text,
            startMs: current[0].startMs,
            endMs: current[current.length - 1].endMs,
            words: current.map(stripSpeakerFromWord),
            speaker: speakers.size === 1 ? [...speakers][0] : undefined,
        });
        current = [];
    };
    for (const word of words) {
        const last = current[current.length - 1];
        const speakerChanged = Boolean(word.speaker) &&
            Boolean(last?.speaker) &&
            word.speaker !== last.speaker;
        const chunkFull = current.length >= chunkSize;
        if (speakerChanged || chunkFull) {
            flush();
        }
        current.push(word);
    }
    flush();
    return segments;
}
function stripSpeakerFromWord(word) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip speaker label
    const { speaker, ...rest } = word;
    return rest;
}
/** Unique speaker labels across segments */
export function listSpeakers(segments) {
    const set = new Set();
    for (const seg of segments) {
        if (seg.speaker)
            set.add(seg.speaker);
    }
    return [...set].sort();
}
/** Human-friendly label for API speaker ids */
export function formatSpeakerLabel(speakerId) {
    const numbered = speakerId.match(/^speaker_(\d+)$/);
    if (numbered) {
        return `Speaker ${Number(numbered[1]) + 1}`;
    }
    if (/^[A-Z]$/.test(speakerId)) {
        return `Speaker ${speakerId}`;
    }
    return speakerId.replace(/_/g, " ");
}
/** Stable palette index for preview UI chips */
export function speakerColorIndex(speakerId, paletteSize) {
    let hash = 0;
    for (let i = 0; i < speakerId.length; i++) {
        hash = (hash * 31 + speakerId.charCodeAt(i)) >>> 0;
    }
    return hash % paletteSize;
}
//# sourceMappingURL=diarization.js.map