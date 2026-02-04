<script lang="ts">
  import { onMount } from "svelte";
  import { getSongDetail } from "$lib/api";
  import { Spinner } from "$lib/components/ui/spinner";
  import * as Card from "$lib/components/ui/card";
  import * as Tabs from "$lib/components/ui/tabs";
  import * as Alert from "$lib/components/ui/alert";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import type { Song, Arrangement } from "$lib/types";

  export let params;

  let data: Song | null = null;
  let loading = true;
  let error: string | null = null;
  let selectedArrangement: string | undefined = undefined;

  onMount(async () => {
    try {
      data = await getSongDetail({ id: params.id });
      selectedArrangement = data?.arrangements?.[0]?.id ?? undefined;
    } catch (e) {
      console.error(e);
      error = "Failed to load song.";
    } finally {
      loading = false;
    }
  });

  /** Utility to render sequence flow */
  function renderSequence(seq: string[] | undefined) {
    if (!seq || seq.length === 0) return null;
    return seq.join(" → ");
  }
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
    <h1 class="text-3xl font-bold tracking-tight">{song.title || "Untitled Song"}</h1>
    {#if song.author}<p class="text-lg text-muted-foreground">by {song.author}</p>{/if}
  </div>

  <!-- Metadata -->
  <Card.Root class="mb-6 p-6">
    <Card.Title>Metadata</Card.Title>
    <Card.Content class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
      {#if song.ccli_number}<div><span class="font-semibold">CCLI:</span> {song.ccli_number}</div>{/if}
      {#if song.copyright}<div><span class="font-semibold">Copyright:</span> {song.copyright}</div>{/if}
      {#if song.themes}<div><span class="font-semibold">Themes:</span> {song.themes}</div>{/if}
      {#if song.created_at}<div><span class="font-semibold">Created:</span> {song.created_at}</div>{/if}
      {#if song.updated_at}<div><span class="font-semibold">Updated:</span> {song.updated_at}</div>{/if}
      {#if song.last_scheduled_at}<div><span class="font-semibold">Last Scheduled:</span> {song.last_scheduled_at}</div>{/if}
    </Card.Content>
  </Card.Root>

  <!-- Notes -->
  {#if song.notes}
    <Card.Root class="mb-6 p-6 bg-muted">
      <Card.Title>Notes</Card.Title>
      <Card.Content><p class="whitespace-pre-wrap text-sm">{song.notes}</p></Card.Content>
    </Card.Root>
  {/if}

  <!-- Arrangements Tabs -->
  {#if song.arrangements!.length > 0}
    <Tabs.Root bind:value={selectedArrangement} class="space-y-4">
      <Tabs.List class="flex space-x-2 mb-4 overflow-x-auto">
        {#each song.arrangements as arr}
          <Tabs.Trigger value={arr.id} class="px-4 py-2 rounded-md bg-card hover:bg-primary/10 text-sm whitespace-nowrap">
            {arr.name || "Unnamed Arrangement"}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>

      {#each song.arrangements as arr}
        <Tabs.Content value={arr.id} class="space-y-4">
          <!-- Arrangement Metadata -->
          <Card.Root class="p-4">
            <Card.Title>Arrangement Info</Card.Title>
            <Card.Content class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {#if arr.bpm}<div><span class="font-semibold">BPM:</span> {arr.bpm}</div>{/if}
              {#if arr.meter}<div><span class="font-semibold">Meter:</span> {arr.meter}</div>{/if}
              {#if arr.length}<div><span class="font-semibold">Length:</span> {arr.length}s</div>{/if}
              {#if arr.chord_chart_key}<div><span class="font-semibold">Key:</span> {arr.chord_chart_key}</div>{/if}
            </Card.Content>
          </Card.Root>

          <!-- Keys -->
          {#if arr.keys!.length > 0}
            <Card.Root class="p-4">
              <Card.Title>Keys</Card.Title>
              <Card.Content class="text-sm space-y-1">
                {#each arr.keys as key}
                  <div>
                    {#if key.name}{key.name}: {/if}
                    {key.starting_key}{key.starting_minor ? "m" : ""}
                    {#if key.ending_key} → {key.ending_key}{key.ending_minor ? "m" : ""}{/if}
                  </div>
                {/each}
              </Card.Content>
            </Card.Root>
          {/if}

          <!-- Sequence Visualization -->
          {#if arr.sequence!.length > 0}
            <Card.Root class="p-4">
              <Card.Title>Sequence</Card.Title>
              <Card.Content class="flex flex-wrap gap-2 items-center">
                {#each arr.sequence as step, index (step)}
                  <div class="px-3 py-1 rounded-full bg-primary/10 text-sm font-medium">{step}</div>
                  {#if index < arr.sequence!.length - 1}
                    <div class="text-muted-foreground font-bold">→</div>
                  {/if}
                {/each}
              </Card.Content>
            </Card.Root>
          {/if}

          <!-- Inner Tabs: Lyrics / Sections / Chord Chart -->
          <Tabs.Root class="space-y-4">
            <Tabs.List class="flex space-x-2 mb-4">
              {#if arr.lyrics}<Tabs.Trigger value="lyrics">Lyrics</Tabs.Trigger>{/if}
              {#if arr.sections!.sections!.length > 0}<Tabs.Trigger value="sections">Sections</Tabs.Trigger>{/if}
              {#if arr.chord_chart}<Tabs.Trigger value="chord">Chord Chart</Tabs.Trigger>{/if}
            </Tabs.List>

            {#if arr.lyrics}
              <Tabs.Content value="lyrics">
                <Card.Root class="p-4">
                  <Card.Title>Lyrics</Card.Title>
                  <Card.Content>
                    <pre class="whitespace-pre-wrap text-sm bg-muted p-3 rounded">{arr.lyrics}</pre>
                  </Card.Content>
                </Card.Root>
              </Tabs.Content>
            {/if}

            {#if arr.sections!.sections!.length > 0}
              <Tabs.Content value="sections">
                <Card.Root class="p-4">
                  <Card.Title>Sections</Card.Title>
                  <Card.Content class="space-y-2">
                    {#each arr!.sections!.sections as sec}
                      <div class="bg-muted p-3 rounded text-sm">
                        {#if sec.label}<div class="font-semibold mb-1">{sec.label}</div>{/if}
                        {#if sec.lyrics}<pre class="whitespace-pre-wrap">{sec.lyrics}</pre>{/if}
                      </div>
                    {/each}
                  </Card.Content>
                </Card.Root>
              </Tabs.Content>
            {/if}

            {#if arr.chord_chart}
              <Tabs.Content value="chord">
                <Card.Root class="p-4">
                  <Card.Title>Chord Chart</Card.Title>
                  <Card.Content>
                    <pre class="whitespace-pre-wrap text-sm bg-muted p-3 rounded overflow-x-auto">{arr.chord_chart}</pre>
                  </Card.Content>
                </Card.Root>
              </Tabs.Content>
            {/if}
          </Tabs.Root>
        </Tabs.Content>
      {/each}
    </Tabs.Root>
  {:else}
    <Card.Root class="p-6 text-center text-muted-foreground">
      No arrangements available for this song.
    </Card.Root>
  {/if}
{/if}
