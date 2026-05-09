<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { ModeWatcher } from "mode-watcher";
    import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Worship Repository</title>
</svelte:head>
<Tooltip.Provider>
    <ModeWatcher />
    <div class=" bg-card">
        <div class="p-5 space-y-6">
            <div class="flex justify-between">
                <div class="">
                    <Breadcrumbs />
                </div>
                <div class=""></div>
            </div>
        </div>
        <div class="rounded-xl bg-background">
            <div class="p-5 space-y-6">
                {@render children()}
            </div>
        </div>
    </div>

    <Footer />
</Tooltip.Provider>
