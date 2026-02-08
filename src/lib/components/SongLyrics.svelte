<script lang="ts">
    import * as Item from "$lib/components/ui/item/index.js";
    let { lyrics }: { lyrics: string } = $props();
</script>

<h1 class="text-base">Lyrics</h1>
<Item.Root variant="muted">
    <Item.Content>
        <pre class="whitespace-pre-wrap">{lyrics}</pre>
    </Item.Content>
</Item.Root>
