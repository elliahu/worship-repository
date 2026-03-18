export interface ChordChunk {
  chord: string | null;
  lyrics: string;
}

export interface LineData {
  type: "lyrics" | "header" | "empty" | "chords"; // "chords" = orphaned chord line
  chunks: ChordChunk[];
  raw: string;
}

// Permissive chord token: starts with a note letter, allows modifiers,
// slash bass (D/F#), and transposition suffix in parens C(G)
const CHORD_TOKEN_RE =
  /^[A-Ga-g][#b♯♭]?[A-Za-z0-9#b]*(\/[A-Ga-g][#b♯♭]?[A-Za-z0-9#b]*)?(\([A-Za-z0-9#b\/]+\))?$/;

function isChordToken(token: string): boolean {
  return CHORD_TOKEN_RE.test(token);
}

/** Returns true if every whitespace-separated token on the line is a chord */
function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return trimmed.split(/\s+/).every(isChordToken);
}

/** Merge a positional chord line with the lyrics line beneath it */
function mergeChordLineWithLyrics(
  chordLine: string,
  lyricsLine: string,
): ChordChunk[] {
  const chordPositions: Array<{ chord: string; pos: number }> = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(chordLine)) !== null) {
    chordPositions.push({ chord: m[0], pos: m.index });
  }

  if (chordPositions.length === 0) {
    return [{ chord: null, lyrics: lyricsLine }];
  }

  const chunks: ChordChunk[] = [];
  const len = lyricsLine.length;

  // Text before the first chord column
  if (chordPositions[0].pos > 0) {
    const prefix = lyricsLine.slice(0, chordPositions[0].pos);
    if (prefix.trim()) chunks.push({ chord: null, lyrics: prefix });
  }

  for (let i = 0; i < chordPositions.length; i++) {
    const { chord, pos } = chordPositions[i];
    const nextPos =
      i + 1 < chordPositions.length ? chordPositions[i + 1].pos : len;
    const lyrics = lyricsLine.slice(pos, Math.min(nextPos, len));
    chunks.push({ chord, lyrics: lyrics ?? "" });
  }

  return chunks;
}

/** Parse a standalone chord-only line into chunks (no associated lyrics) */
function parseChordOnlyLine(line: string): ChordChunk[] {
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  const chunks: ChordChunk[] = [];
  while ((m = re.exec(line)) !== null) {
    chunks.push({ chord: m[0], lyrics: "" });
  }
  return chunks;
}

/** Parse a line with inline [Chord]lyrics notation */
function parseInlineChordLine(line: string): LineData {
  const regex = /(\[.*?\])|([^\[]+)/g;
  const matches = line.match(regex) || [];
  const chunks: ChordChunk[] = [];

  if (matches.length > 0 && !matches[0]!.startsWith("[")) {
    chunks.push({ chord: null, lyrics: matches[0] ?? "" });
    matches.shift();
  }

  for (let i = 0; i < matches.length; i++) {
    const part = matches[i]!;
    if (part.startsWith("[")) {
      const chordName = part.replace(/[\[\]]/g, "");
      let lyrics = "";
      if (i + 1 < matches.length && !matches[i + 1]!.startsWith("[")) {
        lyrics = matches[i + 1]!;
        i++;
      }
      chunks.push({ chord: chordName, lyrics });
    } else {
      chunks.push({ chord: null, lyrics: part });
    }
  }

  return { type: "lyrics", chunks, raw: line };
}

const HEADER_PATTERN =
  /^(verse|chorus|bridge|intro|outro|pre-?chorus|post-?chorus|refrain|interlude|hook|coda|break|solo|tag|capo)\b/i;

function classifyPlainLine(line: string): LineData {
  const trimmed = line.trim();
  const wordCount = trimmed.split(/\s+/).length;
  if (HEADER_PATTERN.test(trimmed) || wordCount <= 3) {
    return {
      type: "header",
      chunks: [{ chord: null, lyrics: line }],
      raw: line,
    };
  }
  return { type: "lyrics", chunks: [{ chord: null, lyrics: line }], raw: line };
}

export function parseChordSheet(input: string): LineData[] {
  const lines = input.split("\n");
  const result: LineData[] = [];
  let pendingChordLine: string | null = null;

  const flushPending = () => {
    if (pendingChordLine !== null) {
      result.push({
        type: "chords",
        chunks: parseChordOnlyLine(pendingChordLine),
        raw: pendingChordLine,
      });
      pendingChordLine = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // 1. Empty line — flush any pending chord line
    if (!trimmed) {
      flushPending();
      result.push({ type: "empty", chunks: [], raw: line });
      continue;
    }

    // 2. Inline [Chord] format
    if (line.includes("[")) {
      flushPending();
      result.push(parseInlineChordLine(line));
      continue;
    }

    // 3. Chord-only line (above-lyric format)
    if (isChordLine(line)) {
      flushPending(); // two chord lines in a row — flush the first
      pendingChordLine = line;
      continue;
    }

    // 4. Regular text line with a pending chord line above it → merge
    if (pendingChordLine !== null) {
      const chunks = mergeChordLineWithLyrics(pendingChordLine, line);
      result.push({ type: "lyrics", chunks, raw: line });
      pendingChordLine = null;
      continue;
    }

    // 5. Plain text line — header or chord-less lyrics
    result.push(classifyPlainLine(line));
  }

  flushPending(); // trailing chord line with no lyrics after it
  return result;
}
