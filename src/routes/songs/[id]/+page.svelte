<script lang="ts">
    import { onMount } from "svelte";
    import { callGetSongDetail } from "$lib/api";
    import { Spinner } from "$lib/components/ui/spinner";

    export let params;

    let data: { item: any } | null = null;
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            data = await callGetSongDetail({ id: params.id });
        } catch (e) {
            console.error(e);
            error = "Failed to load song.";
        } finally {
            loading = false;
        }
    });
</script>

<div>
    {#if loading}
        <div class="flex items-center justify-center space-x-2">
            <Spinner />
            <span>Loading…</span>
        </div>
    {:else if error}
        <div class="text-red-600">{error}</div>
    {:else if data?.item}
        {@const song = data.item}

        <!-- Header -->
        <div class="space-y-2">
            <h1 class="text-3xl font-bold tracking-tight">
                {song.title || "Untitled Song"}
            </h1>
            {#if song.author}
                <p class="text-lg text-muted-foreground">by {song.author}</p>
            {/if}
        </div>

        <!-- Metadata -->
        <div class="grid grid-cols-2 gap-4 text-sm">
            {#if song.ccli_number}
                <div>
                    <span class="font-semibold">CCLI:</span>
                    {song.ccli_number}
                </div>
            {/if}
            {#if song.copyright}
                <div>
                    <span class="font-semibold">Copyright:</span>
                    {song.copyright}
                </div>
            {/if}
            {#if song.themes}
                <div>
                    <span class="font-semibold">Themes:</span>
                    {song.themes}
                </div>
            {/if}
            {#if song.last_scheduled_short_date}
                <div>
                    <span class="font-semibold">Last Scheduled:</span>
                    {song.last_scheduled_short_date}
                </div>
            {/if}
        </div>

        <!-- Notes -->
        {#if song.notes}
            <div class="bg-muted p-4 rounded-lg">
                <h2 class="font-semibold mb-2">Notes</h2>
                <p class="whitespace-pre-wrap">{song.notes}</p>
            </div>
        {/if}

        <!-- Arrangements -->
        {#if song.arrangements && song.arrangements.length > 0}
            <div class="space-y-4">
                <h2 class="text-2xl font-bold">Arrangements</h2>
                {#each song.arrangements as arrangement}
                    <div class="border rounded-lg p-4 space-y-3">
                        <h3 class="text-xl font-semibold">
                            {arrangement.name || "Unnamed Arrangement"}
                        </h3>

                        <!-- Arrangement metadata -->
                        <div
                            class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"
                        >
                            {#if arrangement.bpm}
                                <div>
                                    <span class="font-semibold">BPM:</span>
                                    {arrangement.bpm}
                                </div>
                            {/if}
                            {#if arrangement.meter}
                                <div>
                                    <span class="font-semibold">Meter:</span>
                                    {arrangement.meter}
                                </div>
                            {/if}
                            {#if arrangement.length}
                                <div>
                                    <span class="font-semibold">Length:</span>
                                    {arrangement.length}s
                                </div>
                            {/if}
                            {#if arrangement.chord_chart_key}
                                <div>
                                    <span class="font-semibold">Key:</span>
                                    {arrangement.chord_chart_key}
                                </div>
                            {/if}
                        </div>

                        <!-- Keys -->
                        {#if arrangement.keys && arrangement.keys.length > 0}
                            <div>
                                <h4 class="font-semibold mb-1">Keys</h4>
                                {#each arrangement.keys as key}
                                    <div class="text-sm">
                                        {#if key.name}{key.name}:
                                        {/if}
                                        {key.starting_key ||
                                            ""}{key.starting_minor ? "m" : ""}
                                        {#if key.ending_key}→ {key.ending_key}{key.ending_minor
                                                ? "m"
                                                : ""}{/if}
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        <!-- Arrangement notes -->
                        {#if arrangement.notes}
                            <div class="bg-muted p-3 rounded text-sm">
                                <span class="font-semibold">Notes:</span>
                                {arrangement.notes}
                            </div>
                        {/if}

                        <!-- Sequence -->
                        {#if arrangement.sequence && arrangement.sequence.length > 0}
                            <div>
                                <h4 class="font-semibold mb-1">Sequence</h4>
                                <div class="text-sm">
                                    {arrangement.sequence.join(" → ")}
                                </div>
                            </div>
                        {/if}

                        <!-- Lyrics -->
                        {#if arrangement.lyrics}
                            <div>
                                <h4 class="font-semibold mb-2">Lyrics</h4>
                                <pre
                                    class="whitespace-pre-wrap text-sm bg-muted p-3 rounded">{arrangement.lyrics}</pre>
                            </div>
                        {/if}

                        <!-- Sections -->
                        {#if arrangement.sections?.sections && arrangement.sections.sections.length > 0}
                            <div>
                                <h4 class="font-semibold mb-2">Sections</h4>
                                <div class="space-y-2">
                                    {#each arrangement.sections.sections as section}
                                        <div class="bg-muted p-3 rounded">
                                            {#if section.label}
                                                <div
                                                    class="font-semibold text-sm mb-1"
                                                >
                                                    {section.label}
                                                </div>
                                            {/if}
                                            {#if section.lyrics}
                                                <pre
                                                    class="whitespace-pre-wrap text-sm">{section.lyrics}</pre>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}

                        <!-- Chord Chart -->
                        {#if arrangement.chord_chart}
                            <div>
                                <h4 class="font-semibold mb-2">Chord Chart</h4>
                                <pre
                                    class="whitespace-pre-wrap text-sm bg-muted p-3 rounded overflow-x-auto">{arrangement.chord_chart}</pre>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</div>
