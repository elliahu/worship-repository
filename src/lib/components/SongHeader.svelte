<script lang="ts">
    let { title, author }: { title: string; author?: string } = $props();
</script>

<div class="space-y-2 mb-6">
    <h1 class="text-3xl font-bold tracking-tight">
        {title}
    </h1>
    {#if author}
        <p class="text-lg text-muted-foreground">by {author}</p>
    {/if}
</div>
