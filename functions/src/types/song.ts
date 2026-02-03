export interface Key {
    id: string,
    created_at?: string | undefined;
    updated_at?: string | undefined;
    name?: string | undefined;
    starting_key?: string | undefined;
    ending_key?: string | undefined;
    starting_minor?: boolean | undefined;
    ending_minor?: boolean | undefined;
}

export interface ArrangementSection{
    label?: string | undefined;
    lyrics?: string | undefined;
}


export interface ArrangementSections {
    id: string,
    sections?: ArrangementSection[]
}

export interface Arrangement {
    id: string,
    name?: string | undefined;
    bpm?: number | undefined,
    created_at?: string | undefined;
    updated_at?: string | undefined;
    has_chords?: boolean | undefined;
    has_chord_chart?: boolean | undefined;
    length?: number | undefined;
    meter?: string | undefined;
    notes?: string | undefined;
    chord_chart?: string | undefined;
    chord_chart_key?: string | undefined;
    sequence?: string[];
    sequence_short?: string[];
    sequence_full?: string[];
    lyrics?: string | undefined;
    keys?: Key[];
    sections?: ArrangementSections | undefined;
}

export interface Song {
    id: string;
    title?: string | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    admin?: string | undefined;
    author?: string | undefined;
    copyright?: string | undefined;
    hidden?: boolean | undefined;
    notes?: string | undefined;
    themes?: string | undefined;
    last_scheduled_short_date?: string | undefined;
    last_scheduled_at?: string | undefined;
    ccli_number?: number | undefined;
    arrangements?: Arrangement[];
}

