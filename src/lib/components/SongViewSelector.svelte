<script lang="ts">
	import * as Select from "$lib/components/ui/select/index.js";

	let { value = $bindable() }: { value: string } = $props();

	const views = [
		{ label: "Chord chart", value: "chordchart" },
		{ label: "Lyrics only", value: "lyrics" },
		{ label: "Sections", value: "sections" },
	];

	const triggerLabel = $derived(
		views.find((v) => v.value === value)?.label ?? "Select view"
	);
</script>

<Select.Root type="single" bind:value name="selectedView">
	<Select.Trigger class="mr-1">
		{triggerLabel}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Label>Views</Select.Label>
			{#each views as view}
				<Select.Item value={view.value} label={view.label}>
					{view.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>