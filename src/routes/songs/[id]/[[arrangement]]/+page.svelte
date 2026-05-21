<script lang="ts">
    import { getSongDetail } from "$lib/api";

    import * as Card from "$lib/components/ui/card";
    import * as Alert from "$lib/components/ui/alert";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import type { Song } from "$lib/types";
    import SongBasicInfo from "$lib/components/SongBasicInfo.svelte";
    import SongHeader from "$lib/components/SongHeader.svelte";
    import SongArrangementDetails from "$lib/components/SongArrangementDetails.svelte";
    import SongArrangementSelector from "$lib/components/SongArrangementSelector.svelte";
    import SongViewSelector from "$lib/components/SongViewSelector.svelte";
    import SongDetailSkeleton from "$lib/components/SongDetailSkeleton.svelte";
    import * as Item from "$lib/components/ui/item/index.js";
    import SongChordChart from "$lib/components/SongChordChart.svelte";
    import SongSections from "$lib/components/SongSections.svelte";
    import SongAttachments from "$lib/components/SongAttachments.svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import SongKeySelector from "$lib/components/SongKeySelector.svelte";
    import { getSemitoneDifference } from "$lib/chordParser";

    // Id is required
    // preferedArrangement - if provided, displays this arrangement as default
    // eng - if provided, preferedArrangement is overriden to prefer english arrangements
    // key - is preferred key of the arrangement (if the arrangement have the key, it gets preselected, otherwise it selects default key)

    const id = $derived(page.params.id);
    let preferedArrangement = $derived(page.params.arrangement);
    const eng = $derived.by(() => page.url.searchParams.get("eng") === "true");
    const key = $derived.by(() => page.url.searchParams.get("key"));

    let song = $state<Song | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let selectedArrangement = $state<string | undefined>(undefined);
    let selectedView = $state<string>("chordchart");
    let selectedKey = $state<string | undefined>(undefined);

    $effect(() => {
        async function loadSong() {
            loading = true;
            error = null;
            try {
                const result = await getSongDetail({ id: id! });
                song = result;

                // Select arrangement
                if (eng) {
                    let engArrangement = song.arrangements?.find(
                        (a) =>
                            a.name?.toLocaleLowerCase().includes("anglicky") ||
                            a.name?.toLocaleLowerCase().includes("english"),
                    );
                    if (engArrangement) {
                        preferedArrangement = engArrangement.id;
                    }
                }

                const arrangementExists = song.arrangements?.some(
                    (a) => a.id === preferedArrangement,
                );

                selectedArrangement = arrangementExists
                    ? preferedArrangement
                    : song.arrangements?.[0]?.id;

            } catch (e) {
                console.error(e);
                error = "Failed to load song.";
            } finally {
                loading = false;
            }
        }
        loadSong();
    });

    $effect(() => {
        if (!song || !selectedArrangement) return;

        const arrangement = song.arrangements?.find(
            (a) => a.id === selectedArrangement,
        );

        if (!arrangement?.keys?.length) {
            selectedKey = undefined;
            return;
        }

        // preserve current key if still valid
        const exists = arrangement.keys.some(
            (k) => k.id === selectedKey,
        );

        if (!exists) {
            selectedKey = arrangement.keys[0].id;
        }
    });

    // This updates url when arrangement is selected in a dropdown or key is selected in a dropdown
    $effect(() => {
        if (!selectedArrangement || !id) return;

        const params = new URLSearchParams();

        if (eng) {
            params.set("eng", "true");
        }

        if (selectedKey) {
            params.set("key", selectedKey);
        }

        const query = params.toString();
        const url =
            `/songs/${id}/${selectedArrangement}` +
            (query ? `?${query}` : "");

        goto(url, {
            replaceState: true,
            noScroll: true,
            keepFocus: true,
            invalidateAll: false,
        });
    });
</script>

{#if loading}
    <SongDetailSkeleton />
{:else if error}
    <Alert.Root variant="destructive" class="my-10">
        <AlertCircleIcon />
        <Alert.Title>{error}</Alert.Title>
    </Alert.Root>
{:else if song}
    <!-- Header -->
    <SongHeader title={song.title ?? "Untitled song"} author={song.author} />

    <!-- Metadata -->
    <SongBasicInfo
        info={{
            ccli: song.ccli_number,
            copyright: song.copyright,
            last_scheduled: song.last_scheduled_at,
        }}
    />

    <!-- Arrangements-->
    <Item.Root variant="outline">
        <Item.Content>
            <h1 class="text-xl pb-3">Arrangement</h1>
            {#if song.arrangements && song.arrangements.length > 0}
                <div class="flex">
                    <SongArrangementSelector
                        arrangements={song.arrangements}
                        bind:value={selectedArrangement}
                    />
                    <SongKeySelector keys={song.arrangements?.find((a) => a.id == selectedArrangement)?.keys ?? []} bind:value={selectedKey} />
                    <SongViewSelector bind:value={selectedView} />
                </div>

                {@const selectedArr = song.arrangements.find(
                    (a) => a.id === selectedArrangement,
                )}

                {#if selectedArr}
                    <!-- Arrangement details -->
                    <SongArrangementDetails arrangement={selectedArr} />
                    <!-- Attachnemts -->
                    {#if selectedArr.attachments}
                        <SongAttachments
                            attachments={selectedArr.attachments}
                        />
                    {/if}
                {/if}

                <!-- Chrodchart -->
                {#if selectedView === "chordchart"}
                    {#if selectedArr && selectedArr.chord_chart}

                        {@const selectKey = selectedArr.keys?.find((k) => k.id === selectedKey)}
                        {@const originalKey = selectedArr.chord_chart_key}

                        <SongChordChart
                            chordchart={selectedArr.chord_chart}
                            lyricsOnly={selectedArr.lyrics ?? ""}
                            transposedSemitones={originalKey && selectKey && selectKey.starting_key ? getSemitoneDifference(originalKey, selectKey.starting_key) : 0}
                        />
                    {/if}

                <!-- Sections-->
                {:else if selectedView === "sections"}
                    {#if selectedArr && selectedArr.sections && selectedArr.sections.sections}
                        <SongSections
                            sections={selectedArr.sections.sections}
                            sequence={selectedArr.sequence_full ?? []}
                        />
                    {/if}
                {/if}
            {:else}
                <Card.Root>No arrangements available.</Card.Root>
            {/if}
        </Item.Content>
    </Item.Root>
{/if}
