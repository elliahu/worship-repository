<script lang="ts">
    import { getSongDetail } from "$lib/api";

    import * as Card from "$lib/components/ui/card";
    import * as Alert from "$lib/components/ui/alert";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import type { Song } from "$lib/types";
    import SongBasicInfo from "$lib/components/SongBasicInfo.svelte";
    import SongHeader from "$lib/components/SongHeader.svelte";
    import SongArrangement from "$lib/components/SongArrangement.svelte";
    import SongArrangementSelector from "$lib/components/SongArrangementSelector.svelte";
    import SongViewSelector from "$lib/components/SongViewSelector.svelte";
    import SongDetailSkeleton from "$lib/components/SongDetailSkeleton.svelte";
    import * as Item from "$lib/components/ui/item/index.js";
    import SongChordChart from "$lib/components/SongChordChart.svelte";
    import SongSections from "$lib/components/SongSections.svelte";
    import SongAttachments from "$lib/components/SongAttachments.svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    // Id is required
    // preferedArrangement - if provided, displays this arrangement as default
    // eng - if provided, preferedArrangement is overriden to prefer english arrangements

    const id = $derived(page.params.id);
    let preferedArrangement = $derived(page.params.arrangement);
    const eng = $derived.by(() => page.url.searchParams.get("eng") === "true");

    let song = $state<Song | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let selectedArrangement = $state<string | undefined>(undefined);
    let selectedView = $state<string>("chordchart");

    $effect(() => {
        async function loadSong() {
            loading = true;
            error = null;
            try {
                const result = await getSongDetail({ id: id! });
                song = result;

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

    // This updates url when arrangement is selected in a dropdown
    $effect(() => {
        if (!selectedArrangement || !id) return;

        const url = `/songs/${id}/${selectedArrangement}`;
        goto(`/songs/${id}/${selectedArrangement}`, {
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

                    <SongViewSelector bind:value={selectedView} />
                </div>

                {@const selectedArr = song.arrangements.find(
                    (a) => a.id === selectedArrangement,
                )}
                {#if selectedArr}
                    <SongArrangement arrangement={selectedArr} />
                    {#if selectedArr.attachments}
                        <SongAttachments
                            attachments={selectedArr.attachments}
                        />
                    {/if}
                {/if}

                {#if selectedView === "chordchart"}
                    {#if selectedArr && selectedArr.chord_chart}
                        <SongChordChart
                            chordchart={selectedArr.chord_chart}
                            lyricsOnly={selectedArr.lyrics ?? ""}
                        />
                    {/if}
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

    <!-- Views -->
{/if}
