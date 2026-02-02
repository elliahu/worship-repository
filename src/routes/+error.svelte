<script>
    import { Button } from "$lib/components/ui/button";
    import { ArrowRight } from "lucide-svelte";
</script>

<svelte:head>
    <title>Oops!</title>
</svelte:head>

<div
    class="flex min-h-[80vh] flex-col items-center justify-center space-y-8 text-center px-4"
>
    <header class="space-y-4">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Oops! Something went wrong ...
        </h1>
    </header>
    <div class="flex flex-col sm:flex-row gap-4">
        <Button
            href="/browse"
            size="lg"
            class="group gap-2 px-8"
            variant="outline"
            >Take me back home <ArrowRight
                class="size-4 transition-transform group-hover:translate-x-1"
            /></Button
        >
    </div>
</div>
