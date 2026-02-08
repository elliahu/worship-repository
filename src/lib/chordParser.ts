// chordParser.ts

export interface ChordChunk {
  chord: string | null;
  lyrics: string;
}

export interface LineData {
  type: 'lyrics' | 'header' | 'empty';
  chunks: ChordChunk[];
  raw: string;
}

export function parseChordSheet(input: string): LineData[] {
  // Split by new lines
  const lines = input.split('\n');

  return lines.map((line) => {
    const trimmed = line.trim();
    
    // 1. Handle empty lines
    if (!trimmed) {
      return { type: 'empty', chunks: [], raw: line };
    }

    // 2. Handle Section Headers (e.g., "Verse 1", "Chorus")
    // Heuristic: No square brackets found in the line
    if (!line.includes('[')) {
      return { 
        type: 'header', 
        chunks: [{ chord: null, lyrics: line }], // Treat whole line as lyrics
        raw: line 
      };
    }

    // 3. Handle Lyrics with Chords
    // Regex explanation:
    // (\[.*?\]) -> Capture anything inside square brackets (the chord)
    // ([^\[]*)  -> Capture text that follows until the next bracket (the lyrics)
    // g         -> Global search
    const regex = /(\[.*?\])|([^\[]+)/g;
    const matches = line.match(regex) || [];
    
    const chunks: ChordChunk[] = [];
    let currentChord: string | null = null;
    let currentLyrics = "";

    // If the line starts with text (no chord), we need to handle that
    if (matches.length > 0 && !matches[0]!.startsWith('[')) {
        chunks.push({ chord: null, lyrics: matches[0] ?? "" });
        matches.shift(); // Remove the processed text
    }

    // Iterate through matches to pair chords with following text
    for (let i = 0; i < matches.length; i++) {
        const part = matches[i];
        
        if (part.startsWith('[')) {
            // It's a chord, strip brackets
            const chordName = part.replace(/[\[\]]/g, '');
            
            // Look ahead to see if the next part is lyrics
            let lyrics = "";
            if (i + 1 < matches.length && !matches[i+1].startsWith('[')) {
                lyrics = matches[i+1];
                i++; // Skip next iteration as we consumed the lyrics
            }
            
            chunks.push({ chord: chordName, lyrics: lyrics });
        } else {
            // Stray lyrics (should be caught by logic above, but safe fallback)
            chunks.push({ chord: null, lyrics: part });
        }
    }

    return { type: 'lyrics', chunks, raw: line };
  });
}