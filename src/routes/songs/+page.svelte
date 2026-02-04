<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getSongsIndex } from "$lib/api";
  import SongsTable from "$lib/components/SongsTable.svelte";
  import type { Index } from "$lib/types";

  let data: Index | null = null;
  let loading = true;
  let error: string | null = null;

  const goToDetail = (id: string) => goto(`/songs/${id}`);

  onMount(async () => {
    try {
      data = await getSongsIndex({ orderBy: "title", orderByDirection: "asc" });
    } catch (e) {
      console.error(e);
      error = "Failed to load songs.";
    } finally {
      loading = false;
    }
  });
</script>

<div class="p-10 space-y-6">
  <h1 class="text-3xl font-bold tracking-tight">Browse Repository</h1>

  <SongsTable {data} {loading} {error} onSelect={goToDetail} />
</div>
