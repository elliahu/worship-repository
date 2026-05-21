<script lang="ts">
    import * as Item from "$lib/components/ui/item/index.js";
    import ChordSheet from "./ChordSheet.svelte";
    let {
        chordchart,
        lyricsOnly,
        transposedSemitones,
    }: { chordchart: string; lyricsOnly: string; transposedSemitones: number } =
        $props();
</script>

<h1 class="text-base font-semibold">Chord chart</h1>
<ChordSheet
    songInput={chordchart}
    {lyricsOnly}
    {transposedSemitones}
    showChords
/>
