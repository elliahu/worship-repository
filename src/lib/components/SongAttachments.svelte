<script lang="ts">
    import type { Attachment } from "$lib/types";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import * as Item from "$lib/components/ui/item/index.js";
    import { Link } from "lucide-svelte";

    let { attachments }: { attachments: Attachment[] } = $props();
</script>

<Accordion.Root type="single" class="w-full" value="item-1">
    <Accordion.Item value="item-1">
        <Accordion.Trigger><h1 class="text-base">Attachments</h1></Accordion.Trigger>
        <Accordion.Content>
            {#if attachments.length > 0}
                {#each attachments as att}
                    <a href={att.link} target="_blank">
                        <Item.Root variant="outline" class="mb-2">
                            <Item.Media></Item.Media>
                            <Item.Content>
                                <Item.Title
                                    >{att.display_name ??
                                        att.filename}</Item.Title
                                >
                                <Item.Description
                                    >{att.filename}</Item.Description
                                >
                            </Item.Content>
                            <Item.Actions>
                                <Link />
                            </Item.Actions>
                        </Item.Root>
                    </a>
                {/each}
            {:else}
                <span class="font-semibold">No attachments</span>
            {/if}
        </Accordion.Content>
    </Accordion.Item>
</Accordion.Root>
