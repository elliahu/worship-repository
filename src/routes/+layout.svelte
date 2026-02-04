<script>
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import { ModeWatcher } from "mode-watcher";
	import { Heart } from "lucide-svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Worship Repository</title>
</svelte:head>

<ModeWatcher />
<div class="p-10 space-y-6">
	{@render children()}
</div>
<footer class="mt-16 border-t p-6 text-center text-sm text-muted-foreground">
	<span class="inline-flex items-center gap-1">
		Created with
		<Heart class="h-4 w-4 fill-white text-white" />
		by Matěj Eliáš
	</span>
</footer>

