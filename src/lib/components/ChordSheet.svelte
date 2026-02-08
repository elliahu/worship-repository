<script lang="ts">
    import { Info } from 'lucide-svelte';
    import { parseChordSheet } from "$lib/chordParser";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";

    let {
        songInput,
        lyricsOnly,
        showChords = $bindable(true),
    }: {
        songInput: string;
        lyricsOnly: string;
        showChords: boolean;
    } = $props();

    let parsedLines = $derived(parseChordSheet(songInput));

    const handlePrint = () => {
        window.print();
    };

    const formatOptions = [
        { label: "Pretty print", value: "pretty" },
        { label: "Don't format", value: "raw" },
    ];

    let selectedFormat = $state("pretty");

    const triggerFormatOptionsContent = $derived(
        formatOptions.find((f) => f.value === selectedFormat)?.label ??
            "Select format",
    );
</script>

<div
    class="print-content w-full max-w-3xl p-4 md:p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border font-sans transition-colors print:shadow-none print:border-none print:p-0 print:bg-white print:text-black"
>
    <div
        class="flex items-center gap-2 mb-6 pb-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur-sm z-10 print:hidden"
    >
        <div
            class="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border"
        >
            <span
                class="text-[10px] uppercase tracking-wider text-muted-foreground px-2"
            >
                Tools:
            </span>

            <Button
                onclick={() => (showChords = !showChords)}
                variant={showChords ? "outline" : "secondary"}
                >{showChords ? "Chords On" : "Chords Off"}</Button
            >
            <Select.Root
                type="single"
                name="selectedFormat"
                bind:value={selectedFormat}
            >
                <Select.Trigger>
                    {triggerFormatOptionsContent}
                </Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        <Select.Label>Format</Select.Label>
                        {#each formatOptions as format}
                            <Select.Item
                                value={format.value}
                                label={format.label}
                            >
                                {format.label}
                            </Select.Item>
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
            <div class="w-[1px] h-4 bg-border mx-1"></div>

            <button
                onclick={handlePrint}
                class="p-1.5 hover:bg-background rounded-md cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                title="Print Song"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><polyline points="6 9 6 2 18 2 18 9" /><path
                        d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                    /><rect width="12" height="8" x="6" y="14" /></svg
                >
            </button>
        </div>
    </div>

    {#if selectedFormat === "pretty"}
        <Alert.Root>
            <Info />
            <Alert.Title>This feature is in testing and may break</Alert.Title>
            <Alert.Description
                >If the chords are displayed incorrectly, you can disable pretty
                print in the toolbar above</Alert.Description
            >
        </Alert.Root>
        <div class="print-area">
            {#each parsedLines as line}
                {#if line.type === "empty"}
                    <div class="h-6"></div>
                {:else if line.type === "header"}
                    <h3
                        class="font-bold text-lg text-muted-foreground mt-6 mb-2 uppercase tracking-wide border-b border-border/50 pb-1 print:text-black print:border-black/20"
                    >
                        {line.raw}
                    </h3>
                {:else}
                    <div
                        class="flex flex-wrap items-end mb-2 leading-snug relative print:break-inside-avoid"
                    >
                        {#each line.chunks as chunk}
                            <div class="flex flex-col whitespace-pre-wrap">
                                {#if showChords}
                                    <span
                                        class="font-bold text-sm text-primary select-none mb-0.5 min-h-[1.25rem] print:text-black"
                                        class:invisible={!chunk.chord}
                                    >
                                        {chunk.chord || "X"}
                                    </span>
                                {/if}
                                <span
                                    class="text-foreground text-base font-light print:text-black"
                                >
                                    {chunk.lyrics}
                                </span>
                            </div>
                        {/each}
                    </div>
                {/if}
            {/each}
        </div>
    {:else if showChords}
        <pre>{songInput}</pre>
    {:else}
        <pre>{lyricsOnly}</pre>
    {/if}
</div>

<style>
    @media print {
        /* 1. Hide everything in the body */
        :global(body *) {
            visibility: hidden;
        }

        /* 2. Show the component and its children only */
        :global(.print-content),
        :global(.print-content *) {
            visibility: visible;
        }

        /* 3. Position the component at the top-left of the printed page */
        :global(.print-content) {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
        }
    }
</style>
