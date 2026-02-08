<script lang="ts">
    import type { Arrangement } from "$lib/types";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import * as Item from "$lib/components/ui/item/index.js";

    let { arrangement }: { arrangement: Arrangement } = $props();
</script>

<Accordion.Root type="single" class="w-full" value="item-1">
    <Accordion.Item value="item-1">
        <Accordion.Trigger><h1 class="text-base">Arrangement details</h1></Accordion.Trigger>
        <Accordion.Content>
            <Item.Root variant="muted">
                <Item.Content>
                    {#if arrangement.bpm}<div>
                            <span class="font-semibold">Tempo:</span>
                            {arrangement.bpm} bpm
                        </div>{/if}
                    {#if arrangement.meter}<div>
                            <span class="font-semibold">Meter:</span>
                            {arrangement.meter}
                        </div>{/if}
                    {#if arrangement.length}<div>
                            <span class="font-semibold">Length:</span>
                            {arrangement.length} s
                        </div>{/if}
                    {#if arrangement.chord_chart_key}<div>
                            <span class="font-semibold">Original key:</span>
                            {arrangement.chord_chart_key}
                        </div>{/if}
                </Item.Content>
            </Item.Root>
        </Accordion.Content>
    </Accordion.Item>
</Accordion.Root>
