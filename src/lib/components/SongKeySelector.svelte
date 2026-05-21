<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";
    import type { Key } from "$lib/types";

    let {
        keys,
        value = $bindable(),
    }: {
        keys: Key[];
        value: string | undefined;
    } = $props();

    const triggerLabel = $derived(
        keys.find((k) => k.id === value)?.starting_key ?? "Select key",
    );
</script>

<Select.Root type="single" bind:value name="selectedKey">
    <Select.Trigger class="mr-1">
        {triggerLabel}
    </Select.Trigger>
    <Select.Content>
        <Select.Group>
            <Select.Label>Keys</Select.Label>
            {#each keys as k}
                <Select.Item value={k.id} label={k.starting_key}>
                    {k.starting_key}
                </Select.Item>
            {/each}
        </Select.Group>
    </Select.Content>
</Select.Root>
