<script lang="ts">
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { getNextSundayRange, isInRange } from "$lib/date";
    import CircleAlert from "@lucide/svelte/icons/circle-alert";
    import { onMount } from "svelte";
    import { Spinner } from "$lib/components/ui/spinner/index.js";
    import * as Item from "$lib/components/ui/item/index.js";
    import { ArrowRight, Frown, Music } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let loading = $state<boolean>(true);
    let loadingMesage = $state<string>("");
    let error = $state<string | null>(null);
    let serviceItems = $state<any[] | null>([]);

    // Fetches the id of the sunday service service type
    async function fetchSundayServiceType(): Promise<string> {
        const raw = await fetch("/api/pco/service_types"); // should fetch this 1329064
        const data: any = await raw.json(); // TODO FIXME make this type-safe
        return data.data[0].id;
    }

    // Fetches the plan of the next sunday
    async function fetchSundayPlan(serviceType: string) {
        const raw = await fetch(`/api/pco/service_types/${serviceType}/plans`);
        const data: any = await raw.json(); // TODO FIXME make this type-safe
        const { start, end } = getNextSundayRange(new Date());
        const plans = data.data.filter((p: any) => {
            return isInRange(p.attributes.sort_date, start, end);
        });

        if (!Array.isArray(plans) || plans.length == 0) {
            throw new Error("No plans found for the next sunday");
        }

        return plans[0];
    }

    // Fetches the plans for the sunday service
    async function fetchSundayPlanItems(serviceType: string, plan: string) {
        const raw = await fetch(
            `/api/pco/service_types/${serviceType}/plans/${plan}/items`,
        );
        const data: any = await raw.json(); // TODO FIXME make this type-safe
        return data;
    }

    onMount(async () => {
        loadingMesage = "Looking for next sunday...";
        const serviceType = await fetchSundayServiceType();

        try {
            loadingMesage = "Fetching sunday service plan...";
            const plan = await fetchSundayPlan(serviceType);

            loadingMesage = "Loading songs from the sunday plan...";
            const items = await fetchSundayPlanItems(serviceType, plan.id); // "87435317"
            loadingMesage = "Almost done, hang tight...";
            serviceItems = items.data;

            console.log(items);

            // End the loading
            loading = false;
        } catch (err) {
            if (err instanceof Error) {
                error = err.message;
                console.log(err.message);
            } else {
                error = "Unkwnown error";
            }
        }
    });
</script>

<h1 class="text-3xl font-bold tracking-tight">Sunday playlist</h1>

{#if error}
    <Alert.Root variant="destructive">
        <CircleAlert />
        <Alert.Title
            >Ooops! We are having troubles getting the sunday playlist.</Alert.Title
        >
        <Alert.Description>
            <p>
                Please wait a while and try again later. <b>Error msg:</b>
                <em>{error}</em>
            </p>
        </Alert.Description>
    </Alert.Root>
{:else if loading}
    <Item.Root variant="muted">
        <Item.Media>
            <Spinner />
        </Item.Media>
        <Item.Content>
            <Item.Title class="line-clamp-1">{loadingMesage}</Item.Title>
        </Item.Content>
    </Item.Root>
{:else if serviceItems!.length > 0}
    {#each serviceItems as item}
        {#if item.attributes.item_type === "song"}
            <Item.Root
                variant="muted"
                onclick={() =>
                    goto(`/songs/${item.relationships.song.data.id}`)}
                class="cursor-pointer hover:bg-muted/80 transition-colors"
            >
                <Item.Media>
                    <Music />
                </Item.Media>
                <Item.Content>
                    <Item.Title class="line-clamp-1"
                        >{item.attributes.title}
                        <em class="text-muted-foreground"
                            >in {item.attributes.key_name}</em
                        ></Item.Title
                    >
                </Item.Content>
                <Item.Media>
                    <ArrowRight />
                </Item.Media>
            </Item.Root>
        {/if}
    {/each}
{:else}
    <Item.Root variant="muted">
        <Item.Media>
            <Frown />
        </Item.Media>
        <Item.Content>
            <Item.Title class="line-clamp-1"
                >No songs planned yet. Check back later.</Item.Title
            >
        </Item.Content>
    </Item.Root>
{/if}
