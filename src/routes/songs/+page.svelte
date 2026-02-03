<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import { callGetSongsList } from "$lib/api";
  import { onMount } from "svelte";

  let data: { items: any[] } | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      data = await callGetSongsList();
      console.log(data);
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
            <Table.Cell colspan={2} class="text-center py-10">
              Loading songs…
            </Table.Cell>
          </Table.Row>
        {:else if error}
          <Table.Row>
            <Table.Cell colspan={2} class="text-center py-10 text-destructive">
              {error}
            </Table.Cell>
          </Table.Row>
        {:else if data && data.items.length > 0}
          {#each data.items as item}
            <Table.Row>
              <Table.Cell class="font-medium">
                {item.title}
              </Table.Cell>
              <Table.Cell>
                {item.last_scheduled_short_dates || "Never"}
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
