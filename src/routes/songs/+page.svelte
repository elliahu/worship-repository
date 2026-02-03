<script lang="ts">
  import { onMount } from "svelte";
  import { callGetSongsList } from "$lib/api";
  import SongsTable, { type Song } from "$lib/components/SongsTable.svelte";

  let items: Song[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const data = await callGetSongsList() as { items: Song[] };
      items = data.items;
    } catch (e) {
      console.error(e);
      error = "Failed to load songs.";
    } finally {
      loading = false;
    }
  });
</script>


<h1 class="text-3xl font-bold tracking-tight mb-6">
  Browse Repository
</h1>

<SongsTable
  {items}
  {loading}
  {error}
/>