<script lang="ts">
  import { getSongDetail } from "$lib/api";
  import { Spinner } from "$lib/components/ui/spinner";
  import * as Card from "$lib/components/ui/card";
  import * as Alert from "$lib/components/ui/alert";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import type { Song, Arrangement } from "$lib/types";
  import SongBasicInfo from "$lib/components/SongBasicInfo.svelte";
  import SongHeader from "$lib/components/SongHeader.svelte";
  import SongArrangement from "$lib/components/SongArrangement.svelte";
    import SongArrangementSelector from "$lib/components/SongArrangementSelector.svelte";
    import SongViewSelector from "$lib/components/SongViewSelector.svelte";


  let { params }: { params: { id: string } } = $props();

  let song = $state<Song | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selectedArrangement = $state<string | undefined>(undefined);
  let selectedView = $state<string>("chordchart");

  const views = [
    { label: "Chordchart", value: "chordchart" },
    { label: "Lyrics", value: "lyrics" },
    { label: "Sections", value: "sections" },
  ];

  const triggerArrangementsSelectContent = $derived(
    song?.arrangements!.find((a) => a.id === selectedArrangement)?.name ??
      "Select arrangement",
  );

  const triggerViewSelectContent = $derived(
    views.find((v) => v.value === selectedView)?.label ?? "Select view",
  );

  $effect(() => {
    async function loadSong() {
      loading = true;
      error = null;
      try {
        const result = await getSongDetail({ id: params.id });
        song = result;
        selectedArrangement = song!.arrangements![0]!.id!;
      } catch (e) {
        console.error(e);
        error = "Failed to load song.";
      } finally {
        loading = false;
      }
    }
    loadSong();
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
    {/if}
  {:else}
    <Card.Root>No arrangements available.</Card.Root>
  {/if}

  <!-- Views -->
{/if}
