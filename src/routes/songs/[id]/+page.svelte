<script lang="ts">
    import { onMount } from "svelte";
    import { getSongDetail } from "$lib/api";
    import { Spinner } from "$lib/components/ui/spinner";
    import * as Card from "$lib/components/ui/card";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Alert from "$lib/components/ui/alert";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import type { Song } from "$lib/types";

    export let params;

    let data: Song | null = null;
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            data = await getSongDetail({ id: params.id });
            console.log(data);
        } catch (e) {
            console.error(e);
            error = "Failed to load song.";
        } finally {
            loading = false;
        }
    });
</script>

{#if loading}
    <div class="flex items-center justify-center space-x-2 py-20">
        <Spinner />
        <span class="text-lg text-muted-foreground">Loading song…</span>
    </div>
{:else if error}
    <Alert.Root variant="destructive" class="my-10">
        <AlertCircleIcon />
        <Alert.Title>{error}</Alert.Title>
    </Alert.Root>
{:else if data}
    {@const song = data}

    <!-- Header -->
    <div class="space-y-2 mb-6">
        <h1 class="text-3xl font-bold tracking-tight">
            {song.title || "Untitled Song"}
        </h1>
        {#if song.author}
            <p class="text-lg text-muted-foreground">by {song.author}</p>
        {/if}
    </div>

    <!-- Song Metadata Card -->
    <Card.Root class="mb-6 p-6">
        <Card.Title>Metadata</Card.Title>
        <Card.Content
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm"
        >
            {#if song.ccli_number}<div>
                    <span class="font-semibold">CCLI:</span>
                    {song.ccli_number}
                </div>{/if}
            {#if song.copyright}<div>
                    <span class="font-semibold">Copyright:</span>
                    {song.copyright}
                </div>{/if}
            {#if song.themes}<div>
                    <span class="font-semibold">Themes:</span>
                    {song.themes}
                </div>{/if}

            {#if song.created_at}<div>
                    <span class="font-semibold">Create in Services at:</span>
                    {song.created_at}
                </div>{/if}
            {#if song.updated_at}<div>
                    <span class="font-semibold">Updated in Services at:</span>
                    {song.updated_at}
                </div>{/if}
            {#if song.last_scheduled_at}<div>
                    <span class="font-semibold">Last Scheduled:</span>
                    {song.last_scheduled_at}
                </div>{/if}
        </Card.Content>
    </Card.Root>

    <!-- Notes Card -->
    {#if song.notes}
        <Card.Root class="mb-6 p-6 bg-muted">
            <Card.Title>Notes</Card.Title>
            <Card.Content>
                <p class="whitespace-pre-wrap text-sm">{song.notes}</p>
            </Card.Content>
        </Card.Root>
    {/if}

    <!-- Arrangements Tabs -->
    {#if song.arrangements!.length > 0}
        <Tabs.Root class="space-y-4">
            <Tabs.List class="flex space-x-2 mb-4 overflow-x-auto">
                {#each song.arrangements as arr}
                    <Tabs.Trigger
                        value={arr.id}
                        class="px-4 py-2 rounded-md bg-card hover:bg-primary/10 text-sm"
                    >
                        {arr.name || "Unnamed Arrangement"}
                    </Tabs.Trigger>
                {/each}
            </Tabs.List>

            {#each song.arrangements as arr}
                <Tabs.Content value={arr.id} class="space-y-4">
                    <!-- Arrangement Metadata -->
                    <Card.Root class="p-4">
                        <Card.Title>Arrangement Info</Card.Title>
                        <Card.Content
                            class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"
                        >
                            {#if arr.bpm}<div>
                                    <span class="font-semibold">BPM:</span>
                                    {arr.bpm}
                                </div>{/if}
                            {#if arr.meter}<div>
                                    <span class="font-semibold">Meter:</span>
                                    {arr.meter}
                                </div>{/if}
                            {#if arr.length}<div>
                                    <span class="font-semibold">Length:</span>
                                    {arr.length}s
                                </div>{/if}
                            {#if arr.chord_chart_key}<div>
                                    <span class="font-semibold">Key:</span>
                                    {arr.chord_chart_key}
                                </div>{/if}
                        </Card.Content>
                    </Card.Root>

                    <!-- Keys -->
                    {#if arr.keys!.length > 0}
                        <Card.Root class="p-4">
                            <Card.Title>Keys</Card.Title>
                            <Card.Content class="text-sm space-y-1">
                                {#each arr.keys as key}
                                    <div>
                                        {#if key.name}{key.name}:
                                        {/if}
                                        {key.starting_key}{key.starting_minor
                                            ? "m"
                                            : ""}
                                        {#if key.ending_key}
                                            → {key.ending_key}{key.ending_minor
                                                ? "m"
                                                : ""}{/if}
                                    </div>
                                {/each}
                            </Card.Content>
                        </Card.Root>
                    {/if}

                    <!-- Notes -->
                    {#if arr.notes}
                        <Card.Root class="p-4 bg-muted text-sm">
                            <Card.Title>Notes</Card.Title>
                            <Card.Content>{arr.notes}</Card.Content>
                        </Card.Root>
                    {/if}

                    <!-- Sequence -->
                    {#if arr.sequence!.length > 0}
                        <Card.Root class="p-4">
                            <Card.Title>Sequence</Card.Title>
                            <Card.Content class="text-sm"
                                >{arr.sequence!.join(" → ")}</Card.Content
                            >
                        </Card.Root>
                    {/if}

                    <!-- Lyrics -->
                    {#if arr.lyrics}
                        <Card.Root class="p-4">
                            <Card.Title>Lyrics</Card.Title>
                            <Card.Content>
                                <pre
                                    class="whitespace-pre-wrap text-sm bg-muted p-3 rounded">{arr.lyrics}</pre>
                            </Card.Content>
                        </Card.Root>
                    {/if}

                    <!-- Sections -->
                    {#if arr.sections!.sections!.length > 0}
                        <Card.Root class="p-4">
                            <Card.Title>Sections</Card.Title>
                            <Card.Content class="space-y-2">
                                {#each arr.sections!.sections as sec}
                                    <div class="bg-muted p-3 rounded text-sm">
                                        {#if sec.label}<div
                                                class="font-semibold mb-1"
                                            >
                                                {sec.label}
                                            </div>{/if}
                                        {#if sec.lyrics}<pre
                                                class="whitespace-pre-wrap">{sec.lyrics}</pre>{/if}
                                    </div>
                                {/each}
                            </Card.Content>
                        </Card.Root>
                    {/if}

                    <!-- Chord Chart -->
                    {#if arr.chord_chart}
                        <Card.Root class="p-4">
                            <Card.Title>Chord Chart</Card.Title>
                            <Card.Content>
                                <pre
                                    class="whitespace-pre-wrap text-sm bg-muted p-3 rounded overflow-x-auto">{arr.chord_chart}</pre>
                            </Card.Content>
                        </Card.Root>
                    {/if}
                </Tabs.Content>
            {/each}
        </Tabs.Root>
    {/if}
{/if}
