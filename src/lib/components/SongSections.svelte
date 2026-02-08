<script lang="ts">
    import * as Item from "$lib/components/ui/item/index.js";
    import type { ArrangementSection, SequenceElement } from "$lib/types";
    let {
        sections,
        sequence,
    }: { sections: ArrangementSection[]; sequence: SequenceElement[] } =
        $props();
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

{#if sequence.length > 0}
    <h1 class="text-md pt-1 pb-1">Sequence</h1>
    {#each sequence as element}
        <p>{element}</p>
    {/each}
{/if}
