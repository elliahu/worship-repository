<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import { Spinner } from "$lib/components/ui/spinner/index.js";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import type { Index } from "$lib/types";
  import { Input } from "./ui/input";

  export let data: Index | null = null;
  export let loading: boolean = false;
  export let error: string | null = null;
  export let onSelect: (id: string) => void;

  let searchTerm = "";

  // Filtered list based on search term (title or author)
  $: filtered =
    data?.index.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];
</script>

<div class="space-y-2">
  <!-- Search + Summary -->
  <div class="flex items-center justify-between space-x-4">
    <Input type="email" placeholder="Search by title or author..." class="max-w-xs" bind:value={searchTerm}/>

    {#if loading}
      <p class="text-sm text-muted-foreground">Loading…</p>
    {:else if data}
      <p class="text-sm text-muted-foreground">
        Showing {filtered.length} of {data.index.length} songs
      </p>
    {/if}
  </div>

  <div class="border rounded-md bg-card">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="p-4">Title</Table.Head>
          <Table.Head class="p-4">Last Scheduled</Table.Head>
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
            <Table.Cell colspan={2} class="text-center py-10">
              <Alert.Root variant="destructive">
                <AlertCircleIcon />
                <Alert.Title>{error}</Alert.Title>
              </Alert.Root>
            </Table.Cell>
          </Table.Row>
        {:else if filtered.length > 0}
          {#each filtered as item}
            <Table.Row class="hover:bg-muted/50 transition-colors">
              <Table.Cell class="p-0">
                <button
                  on:click={() => onSelect(item.id)}
                  class="w-full h-full text-left px-4 py-3 cursor-pointer"
                >
                  <div class="font-medium">{item.title}</div>
                  <div class="text-xs text-muted-foreground">{item.author}</div>
                </button>
              </Table.Cell>
              <Table.Cell class="p-4">
                {item.last_scheduled}
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
