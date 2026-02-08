<script lang="ts">
    import { parseChordSheet } from "$lib/chordParser";

    let { songInput, showChords = true }: { songInput: string; showChords: boolean } =
        $props();

    // Reactively parse the input
    let parsedLines = $derived(parseChordSheet(songInput));
</script>

<div
    class="w-full max-w-3xl p-4 md:p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border font-sans transition-colors"
>
    {#each parsedLines as line}
        {#if line.type === "empty"}
            <div class="h-6"></div>
        {:else if line.type === "header"}
            <h3
                class="font-bold text-lg text-muted-foreground mt-6 mb-2 uppercase tracking-wide border-b border-border/50 pb-1"
            >
                {line.raw}
            </h3>
        {:else}
            <div class="flex flex-wrap items-end mb-2 leading-snug relative">
                {#each line.chunks as chunk}
                    <div class="flex flex-col whitespace-pre-wrap">
                        {#if showChords}
                            <span
                                class="font-bold text-sm text-primary select-none mb-0.5 min-h-[1.25rem]"
                                class:invisible={!chunk.chord}
                            >
                                {chunk.chord || "X"}
                            </span>
                        {/if}

                        <span class="text-foreground text-base">
                            {chunk.lyrics}
                        </span>
                    </div>
                {/each}
            </div>
        {/if}
    {/each}
</div>