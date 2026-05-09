<script lang="ts">
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { page } from "$app/state";

    let crumbs = $derived.by(() =>
        page.url.pathname.split("/").filter(Boolean),
    );

    const getRoute = (index: number) => {
        return "/" + crumbs.slice(0, index + 1).join("/");
    };

    const format = (value: string) => {
        return value
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
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
                {#if index === crumbs.length - 1}
                    <Breadcrumb.Page>
                        {format(crumb)}
                    </Breadcrumb.Page>
                {:else}
                    <Breadcrumb.Link href={getRoute(index)}>
                        {format(crumb)}
                    </Breadcrumb.Link>
                {/if}
            </Breadcrumb.Item>
        {/each}
    </Breadcrumb.List>
</Breadcrumb.Root>
