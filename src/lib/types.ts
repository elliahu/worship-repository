export interface Key {
    id: string,
    created_at?: string;
    updated_at?: string;
    name?: string;
    starting_key?: string;
    ending_key?: string;
    starting_minor?: boolean;
    ending_minor?: boolean;
}

export interface ArrangementSection {
    label?: string;
    lyrics?: string;
}


export interface ArrangementSections {
    id: string,
    sections?: ArrangementSection[]
}

export interface SequenceElement {
    id: number,
    label: string,
    number: number
}

export interface Attachment {
    id: string,
    allow_mp3_download?: boolean,
    content?: string,
    content_type?: string,
    created_at?: string,
    display_name?: string,
    downloadable: boolean,
    file_size: number,
    filename?: string,
    filetype?: string,
    has_preview: boolean,
    link: string
}

export interface Arrangement {
    id: string,
    name?: string;
    bpm?: number;
    created_at?: string;
    updated_at?: string;
    has_chords?: boolean;
    has_chord_chart?: boolean;
    length?: number;
    meter?: string;
    notes?: string;
    chord_chart?: string;
    chord_chart_key?: string;
    sequence?: string[];
    sequence_short?: string[];
    sequence_full?: SequenceElement[];
    lyrics?: string;
    keys?: Key[];
    sections?: ArrangementSections;
    attachments?: Attachment[] 
}

export interface Song {
    id: string;
    title?: string;
    created_at?: string;
    updated_at?: string;
    admin?: string;
    author?: string;
    copyright?: string;
    hidden?: boolean;
    notes?: string;
    themes?: string;
    last_scheduled_short_date?: string;
    last_scheduled_at?: string;
    ccli_number?: number;
    arrangements?: Arrangement[];
}

export interface IndexItem {
    id: string,
    title: string,
    author?: string;
    last_scheduled?: string;
}

export interface Index {
    index: IndexItem[];
}
