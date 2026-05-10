export interface ChordChunk {
  chord: string | null;
  lyrics: string;
}

export interface LineData {
  type: "lyrics" | "header" | "empty" | "chords";
  chunks: ChordChunk[];
  raw: string;
}

// CHORD DETECTION

const CHORD_TOKEN_RE =
  /^[A-Ga-g][#b♯♭]?[A-Za-z0-9#b]*(\/[A-Ga-g][#b♯♭]?[A-Za-z0-9#b]*)?(\([A-Za-z0-9#b\/]+\))?$/;

function isChordToken(token: string): boolean {
  return CHORD_TOKEN_RE.test(token);
}

function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return trimmed.split(/\s+/).every(isChordToken);
}

// TRANSPOSITION

const SHARP_SCALE = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const FLAT_EQUIVALENTS: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
  "D♭": "C#",
  "E♭": "D#",
  "G♭": "F#",
  "A♭": "G#",
  "B♭": "A#",
};

function normalizeNote(note: string): string {
  return FLAT_EQUIVALENTS[note] ?? note.replace("♯", "#").replace("♭", "b");
}

function transposeNote(note: string, semitones: number): string {
  const normalized = normalizeNote(note);

  const idx = SHARP_SCALE.indexOf(normalized);
  if (idx === -1) return note;

  const next = (idx + semitones + 12) % 12;
  return SHARP_SCALE[next]!;
}

/**
 * Transposes a chord like:
 * Cmaj7 -> Dmaj7
 * F#m   -> G#m
 * Bb/D  -> C/E
 * C(G)  -> D(A)
 */
export function transposeChord(chord: string, semitones: number): string {
  return chord.replace(/([A-G][#b♯♭]?)/g, (match) =>
    transposeNote(match, semitones),
  );
}

/**
 * Transpose all chords in parsed lines
 */
export function transposeChordSheet(
  lines: LineData[],
  semitones: number,
): LineData[] {
  return lines.map((line) => ({
    ...line,
    chunks: line.chunks.map((chunk) => ({
      ...chunk,
      chord: chunk.chord ? transposeChord(chunk.chord, semitones) : null,
    })),
  }));
}

// PARSING

function mergeChordLineWithLyrics(
  chordLine: string,
  lyricsLine: string,
): ChordChunk[] {
  const chordPositions: Array<{ chord: string; pos: number }> = [];

  const re = /\S+/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(chordLine)) !== null) {
    chordPositions.push({
      chord: m[0],
      pos: m.index,
    });
  }

  if (chordPositions.length === 0) {
    return [{ chord: null, lyrics: lyricsLine }];
  }

  const chunks: ChordChunk[] = [];
  const len = lyricsLine.length;

  if (chordPositions[0].pos > 0) {
    const prefix = lyricsLine.slice(0, chordPositions[0].pos);

    if (prefix.trim()) {
      chunks.push({
        chord: null,
        lyrics: prefix,
      });
    }
  }

  for (let i = 0; i < chordPositions.length; i++) {
    const { chord, pos } = chordPositions[i];

    const nextPos =
      i + 1 < chordPositions.length ? chordPositions[i + 1].pos : len;

    const lyrics = lyricsLine.slice(pos, Math.min(nextPos, len));

    chunks.push({
      chord,
      lyrics: lyrics ?? "",
    });
  }

  return chunks;
}

function parseChordOnlyLine(line: string): ChordChunk[] {
  const re = /\S+/g;
  let m: RegExpExecArray | null;

  const chunks: ChordChunk[] = [];

  while ((m = re.exec(line)) !== null) {
    chunks.push({
      chord: m[0],
      lyrics: "",
    });
  }

  return chunks;
}

function parseInlineChordLine(line: string): LineData {
  const regex = /(\[.*?\])|([^\[]+)/g;
  const matches = line.match(regex) || [];

  const chunks: ChordChunk[] = [];

  if (matches.length > 0 && !matches[0]!.startsWith("[")) {
    chunks.push({
      chord: null,
      lyrics: matches[0] ?? "",
    });

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

      chunks.push({
        chord: chordName,
        lyrics,
      });
    } else {
      chunks.push({
        chord: null,
        lyrics: part,
      });
    }
  }

  return {
    type: "lyrics",
    chunks,
    raw: line,
  };
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

  return {
    type: "lyrics",
    chunks: [{ chord: null, lyrics: line }],
    raw: line,
  };
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

    if (!trimmed) {
      flushPending();

      result.push({
        type: "empty",
        chunks: [],
        raw: line,
      });

      continue;
    }

    if (line.includes("[")) {
      flushPending();
      result.push(parseInlineChordLine(line));
      continue;
    }

    if (isChordLine(line)) {
      flushPending();
      pendingChordLine = line;
      continue;
    }

    if (pendingChordLine !== null) {
      const chunks = mergeChordLineWithLyrics(pendingChordLine, line);

      result.push({
        type: "lyrics",
        chunks,
        raw: line,
      });

      pendingChordLine = null;

      continue;
    }

    result.push(classifyPlainLine(line));
  }

  flushPending();

  return result;
}
