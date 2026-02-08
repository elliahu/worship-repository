<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import { ModeWatcher } from "mode-watcher";
	import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
	import { page } from "$app/state";
	import Footer from "$lib/components/Footer.svelte";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	let { children } = $props();

	let url: string = $derived.by(() => {
		return page.url.pathname;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Worship Repository</title>
</svelte:head>
<Tooltip.Provider>
	<ModeWatcher />
	<div class="p-10 space-y-6">
		<Breadcrumbs {url} />
		{@render children()}
	</div>
	<Footer />
</Tooltip.Provider>
