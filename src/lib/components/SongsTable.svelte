<script context="module" lang="ts">
    export type Song = {
        id: string;
        title: string;
        author: string;
        last_scheduled_at?: string;
    };
</script>

<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import { goto } from "$app/navigation";
    import { Spinner } from "$lib/components/ui/spinner";
    import * as Alert from "$lib/components/ui/alert";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import { Document } from "flexsearch";

    export let items: Song[] = [];
    export let loading = false;
    export let error: string | null = null;

    let query = "";
    let filteredItems: Song[] = [];

    const index = new Document<Song>({
        document: {
            id: "id",
            index: ["title", "author"],
            store: true,
        },
    });

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

    // Rebuild index when items change
    $: if (items) {
        index.clear();
        items.forEach((song) => index.add(song));
        filteredItems = items;
    }

    // Reactive search
    $: if (!query.trim()) {
        filteredItems = items;
    } else {
        const results = index.search(query, { enrich: true });
        filteredItems = results
            .flatMap((r) => r.result.map((res) => res.doc))
            .filter((doc): doc is Song => doc !== null);
    }
</script>

<!-- Search + count -->
<div class="flex items-center justify-between gap-4 mb-4">
    <input
        bind:value={query}
        placeholder="Search title or author…"
        class="h-9 w-64 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
    />

    <p class="text-sm text-muted-foreground">
        Showing {filteredItems.length} of {items.length} songs
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
            {#if loading}
                <Table.Row>
                    <Table.Cell colspan={2} class="py-10 text-center">
                        <Spinner /> Loading songs…
                    </Table.Cell>
                </Table.Row>
            {:else if error}
                <Table.Row>
                    <Table.Cell colspan={2} class="py-10">
                        <Alert.Root variant="destructive">
                            <AlertCircleIcon />
                            <Alert.Title>{error}</Alert.Title>
                        </Alert.Root>
                    </Table.Cell>
                </Table.Row>
            {:else if filteredItems.length > 0}
                {#each filteredItems as item}
                    <Table.Row class="hover:bg-muted/50 transition-colors">
                        <Table.Cell class="p-0">
                            <button
                                on:click={() => goToDetail(item.id)}
                                class="w-full px-4 py-3 text-left cursor-pointer"
                            >
                                <div class="font-medium">{item.title}</div>
                                <div class="text-xs text-muted-foreground">
                                    {item.author}
                                </div>
                            </button>
                        </Table.Cell>
                        <Table.Cell>
                            {formatDate(item.last_scheduled_at)}
                        </Table.Cell>
                    </Table.Row>
                {/each}
            {:else}
                <Table.Row>
                    <Table.Cell colspan={2} class="py-10 text-center">
                        No matching songs.
                    </Table.Cell>
                </Table.Row>
            {/if}
        </Table.Body>
    </Table.Root>
</div>
