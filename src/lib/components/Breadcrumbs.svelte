<script lang="ts">
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";

    let { url }: { url: string } = $props();

    let crumbs = $derived(url.split("/").filter(Boolean));

    const getRoute = (index: number) => {
        let route = "/" + crumbs.slice(0, index + 1).join("/");
        return route;
    };
</script>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        {#each crumbs as crumb, index}
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                {#if index == crumbs.length - 1}
                    <Breadcrumb.Page>{crumb}</Breadcrumb.Page>
                {:else}
                    <Breadcrumb.Link href={getRoute(index)}
                        >{crumb}</Breadcrumb.Link
                    >
                {/if}
            </Breadcrumb.Item>
        {/each}
    </Breadcrumb.List>
</Breadcrumb.Root>
