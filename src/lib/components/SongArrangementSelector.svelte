<script lang="ts">
	import * as Select from "$lib/components/ui/select/index.js";
	import type { Arrangement } from "$lib/types";

	let { 
		arrangements, 
		value = $bindable() 
	}: { 
		arrangements: Arrangement[], 
		value: string | undefined 
	} = $props();

	// Calculate the label based on current selection
	const triggerLabel = $derived(
		arrangements.find((a) => a.id === value)?.name ?? "Select arrangement"
	);
</script>

<Select.Root type="single" bind:value name="selectedArrangement">
	<Select.Trigger class="mr-1">
		{triggerLabel}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Label>Arrangements</Select.Label>
			{#each arrangements as arr}
				<Select.Item
					value={arr.id}
					label={arr.name}
					disabled={arr.name?.toLowerCase() === "smazat"}
				>
					{arr.name}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>