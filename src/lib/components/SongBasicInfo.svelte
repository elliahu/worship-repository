<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    let {
        info,
    }: {
        info: {
            ccli?: number;
            copyright?: string;
            last_scheduled?: string;
        };
    } = $props();
</script>

<Accordion.Root type="single" class="w-full" value="item-1">
    <Accordion.Item value="item-1">
        <Accordion.Trigger>About the song</Accordion.Trigger>
        <Accordion.Content>
            {#if info.ccli}<div>
                    <span class="font-semibold">CCLI:</span>
                    {info.ccli}
                </div>{/if}
            {#if info.copyright}<div>
                    <span class="font-semibold">Copyright:</span>
                    {info.copyright}
                </div>{/if}
            {#if info.last_scheduled}<div>
                    <span class="font-semibold">Last Scheduled:</span>
                    {info.last_scheduled}
                </div>{/if}
            {#if !info.last_scheduled && !info.ccli && !info.copyright}
                <span class="font-light">Nothing to show</span>
            {/if}
        </Accordion.Content>
    </Accordion.Item>
</Accordion.Root>
