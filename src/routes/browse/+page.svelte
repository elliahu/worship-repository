<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import { Button } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";
  import { goto } from "$app/navigation";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";

  let { data } = $props();

  // Helper to update URL params without a full page reload
  function updatePage(newPage: number) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage.toString());
    goto(url.toString(), { keepFocus: true });
  }

  function updateLimit(newLimit: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('per_page', newLimit);
    url.searchParams.set('page', '1'); // Reset to page 1 on limit change
    goto(url.toString());
  }
</script>

<div class="p-10 space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold tracking-tight">Browse Repository</h1>
    <p class="text-sm text-muted-foreground">
      Showing {data.items.length} of {data.meta.total_count} songs
    </p>
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
        {#each data.items as item}
          <Table.Row>
            <Table.Cell class="font-medium">{item.attributes.title}</Table.Cell>
            <Table.Cell>{item.attributes.last_scheduled_short_dates || 'Never'}</Table.Cell>
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={2} class="text-center py-10">No songs found.</Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex items-center justify-between px-2">
    <div class="flex items-center space-x-2">
      <p class="text-sm font-medium">Rows per page</p>
      <select 
        class="border rounded p-1 text-sm bg-background"
        value={`${data.pagination.perPage}`} 
        onchange={(e) => updateLimit(e.currentTarget.value)}
      >
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>

    <div class="flex items-center space-x-6 lg:space-x-8">
      <div class="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {data.pagination.page} of {data.pagination.totalPages}
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onclick={() => updatePage(data.pagination.page - 1)}
          disabled={data.pagination.page <= 1}
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onclick={() => updatePage(data.pagination.page + 1)}
          disabled={data.pagination.page >= data.pagination.totalPages}
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</div>