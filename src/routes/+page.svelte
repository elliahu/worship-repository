<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { ArrowRight } from "lucide-svelte";
</script>

<div class="flex min-h-[80vh] flex-col items-center justify-center space-y-8 text-center px-4">
  <header class="space-y-4">
    <h1 class="text-4xl font-extrabold tracking-tight sm:text-6xl">
      Welcome to <span class="text-primary">Worship Repository</span>
    </h1>
    <p class="mx-auto max-w-[600px] text-lg text-muted-foreground sm:text-xl">
      Your central hub for managing and browsing API-driven worship content. Fast, synced, and always ready.
    </p>
  </header>

  <div class="flex flex-col sm:flex-row gap-4">
    <Button href="/songs" size="lg" class="group gap-2 px-8">
      Take me there
      <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
    </Button>
    
    <Button href="#" variant="outline" size="lg">
      View GitHub
    </Button>
  </div>
</div>