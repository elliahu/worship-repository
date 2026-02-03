<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import { callGetSongsList } from "$lib/api";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Spinner } from "$lib/components/ui/spinner/index.js";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";

  let data: { items: any[] } | null = null;
  let loading = true;
  let error: string | null = null;

  // Helper function to format ISO dates
  const formatDate = (iso?: string) => {
    if (!iso) return "Never";
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour12: false,
    });
  };

  const goToDetail = (id: string) => {
    goto(`/songs/${id}`);
  };

  onMount(async () => {
    try {
      data = await callGetSongsList();
    } catch (e) {
      console.error(e);
      error = "Failed to load songs.";
    } finally {
      loading = false;
    }
  });
</script>

<div class="p-10 space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold tracking-tight">Browse Repository</h1>

    {#if loading}
      <p class="text-sm text-muted-foreground">Loading…</p>
    {:else if data}
      <p class="text-sm text-muted-foreground">
        Showing {data.items.length} of {data.items.length} songs
      </p>
    {/if}
  </div>

  <div class="border rounded-md bg-card">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Title</Table.Head>
          <Table.Head>Last Scheduled</Table.Head>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {#if loading}
          <Table.Row>
            <Table.Cell colspan={2} class="py-10">
              <div class="flex items-center justify-center space-x-2">
                <Spinner />
                <span>Loading songs…</span>
              </div>
            </Table.Cell>
          </Table.Row>
        {:else if error}
          <Table.Row>
            <Table.Cell colspan={2} class="text-center py-10 text-destructive">
              
              <Alert.Root variant="destructive">
                <AlertCircleIcon />
                <Alert.Title>{error}</Alert.Title>
              </Alert.Root>
            </Table.Cell>
          </Table.Row>
        {:else if data && data.items.length > 0}
          {#each data.items as item}
            <Table.Row class="hover:bg-muted/50 transition-colors">
              <Table.Cell class="p-0">
                <button
                  on:click={() => goToDetail(item.id)}
                  class="w-full h-full text-left px-4 py-3 cursor-pointer"
                >
                  {item.title}
                </button>
              </Table.Cell>
              <Table.Cell class="p-0">
                {formatDate(item.last_scheduled_at)}
              </Table.Cell>
            </Table.Row>
          {/each}
        {:else}
          <Table.Row>
            <Table.Cell colspan={2} class="text-center py-10">
              No songs found.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
</div>
