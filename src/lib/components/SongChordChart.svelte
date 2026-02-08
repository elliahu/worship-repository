<script lang="ts">
    import * as Item from "$lib/components/ui/item/index.js";
    import ChordSheet from "./ChordSheet.svelte";
    let { chordchart }: { chordchart: string } = $props();
</script>

<h1 class="text-base">Chord chart</h1>
<ChordSheet songInput={chordchart} showChords />
