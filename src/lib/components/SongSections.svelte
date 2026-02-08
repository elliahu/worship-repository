<script lang="ts">
    import * as Item from "$lib/components/ui/item/index.js";
    import type { ArrangementSection } from "$lib/types";
    let { sections }: { sections: ArrangementSection[] } = $props();
</script>

<h1 class="text-base">Lyrics sections</h1>
{#each sections as section}
    <Item.Root variant="muted">
        <Item.Content>
            <div class="font-semibold mb-1">{section.label}</div>
            <pre class="whitespace-pre-wrap">{section.lyrics}</pre>
        </Item.Content>
    </Item.Root>
{/each}
