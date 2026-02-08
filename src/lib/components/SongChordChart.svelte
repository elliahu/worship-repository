<script lang="ts">
    import * as Item from "$lib/components/ui/item/index.js";
    let { chordchart }: { chordchart: string } = $props();
</script>

<h1 class="text-base">Chord chart</h1>
<Item.Root variant="muted">
    <Item.Content>
        <pre class="whitespace-pre-wrap">{chordchart}</pre>
    </Item.Content>
</Item.Root>
