<script lang="ts">
    import { Info, Maximize, Minimize, Plus } from "lucide-svelte";
    import { onMount } from "svelte";
    import { parseChordSheet, transposeChordSheet } from "$lib/chordParser";
    import * as Select from "$lib/components/ui/select/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { Printer, Fullscreen, FileMusic, File } from "lucide-svelte";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import * as Item from "$lib/components/ui/item/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import Minus from "@lucide/svelte/icons/minus";

    // Esc to disable fullscreen
    onMount(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") isFullscreen = false;
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    });

    let {
        songInput,
        lyricsOnly,
        showChords = $bindable(true),
    }: {
        songInput: string;
        lyricsOnly: string;
        showChords: boolean;
    } = $props();

    let transposedSemitones = $state(0);
    let parsedLines = $derived(
        transposeChordSheet(parseChordSheet(songInput), transposedSemitones),
    );

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

    let isFullscreen = $state(false);
</script>

<div
    class={`print-content w-full max-w-3xl p-4 md:p-6 bg-card text-card-foreground rounded-xl shadow-sm border border-border font-sans transition-all duration-200
    ${
        isFullscreen
            ? "fixed inset-0 z-50 max-w-none w-screen h-screen overflow-auto rounded-none"
            : ""
    }
    print:shadow-none print:border-none print:p-0 print:bg-white print:text-black`}
>
    <div
        class="flex items-center gap-2 mb-6 pb-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur-sm z-10 print:hidden"
    >
        <div
            class="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border w-full"
        >
            <Tooltip.Root>
                <Tooltip.Trigger>
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
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>
                        Select how to display the song. Pretty print displays
                        the song in more readable fashion, while dont't format
                        displays original raw format.
                    </p>
                </Tooltip.Content>
            </Tooltip.Root>

            <!--Devider-->
            <div class="w-[1px] h-4 bg-border mx-1"></div>

            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Button
                        type="button"
                        variant="outline"
                        onclick={() => {
                            transposedSemitones--;
                        }}><Minus /></Button
                    >
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Transpose one semtone down</p>
                </Tooltip.Content>
            </Tooltip.Root>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <span class="mr-2 ml-2">{transposedSemitones}</span>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Current transposition in number of semtiones</p>
                </Tooltip.Content>
            </Tooltip.Root>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Button
                        type="button"
                        variant="outline"
                        onclick={() => {
                            transposedSemitones++;
                        }}><Plus /></Button
                    >
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Transpose one semtone up</p>
                </Tooltip.Content>
            </Tooltip.Root>

            <!--Devider-->
            <div class="w-[1px] h-4 bg-border mx-1"></div>

            <Tooltip.Root>
                <Tooltip.Trigger>
                    {#if showChords}
                        <FileMusic
                            onclick={() => (showChords = !showChords)}
                            class="cursor-pointer"
                            strokeWidth={1}
                        />
                    {:else}
                        <File
                            onclick={() => (showChords = !showChords)}
                            class="cursor-pointer"
                            strokeWidth={1}
                        />
                    {/if}
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>{showChords ? "Hide" : "Show"} chords</p>
                </Tooltip.Content>
            </Tooltip.Root>

            <!--Devider-->
            <div class="w-[1px] h-4 bg-border mx-1"></div>

            <Tooltip.Root>
                <Tooltip.Trigger>
                    {#if isFullscreen}
                        <Minimize
                            onclick={() => (isFullscreen = !isFullscreen)}
                            class="cursor-pointer"
                            strokeWidth={1}
                        />
                    {:else}
                        <Maximize
                            onclick={() => (isFullscreen = !isFullscreen)}
                            class="cursor-pointer"
                            strokeWidth={1}
                        />
                    {/if}
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>{isFullscreen ? "Minimize" : "Go fullscreen"}</p>
                </Tooltip.Content>
            </Tooltip.Root>

            <!--Devider-->
            <div class="w-[1px] h-4 bg-border mx-1"></div>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Printer
                        onclick={handlePrint}
                        class="cursor-pointer"
                        strokeWidth={1}
                    />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Print this</p>
                </Tooltip.Content>
            </Tooltip.Root>
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
        <div class="print-area mt-8">
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
