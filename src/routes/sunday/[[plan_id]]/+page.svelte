<script lang="ts">
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { getNextSundayRange, isInRange } from "$lib/date";
    import CircleAlert from "@lucide/svelte/icons/circle-alert";
    import { onMount } from "svelte";
    import { Spinner } from "$lib/components/ui/spinner/index.js";
    import * as Item from "$lib/components/ui/item/index.js";
    import { ArrowRight, Frown, Music, QrCodeIcon } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import QRCode from "qrcode";
    import Calendar from "$lib/components/Calendar.svelte";
    import {
        CalendarDate,
        getLocalTimeZone,
        today,
    } from "@internationalized/date";

    const planId = $derived(page.params.plan_id);
    const eng = $derived.by(() => page.url.searchParams.get("eng") === "true");

    let loading = $state<boolean>(true);
    let loadingMesage = $state<string>("");
    let error = $state<string | null>(null);
    let serviceItems = $state<any[] | null>([]);
    let englishPreferred = $state(eng);
    let qrUrl = $state<string | null>(null);
    let selectedDate = $state<CalendarDate | undefined>(undefined);

    $effect(() => {
        englishPreferred = eng;
    });

    $effect(() => {
        if (!planId) return; // don't update URL until plan is resolved
        const params = new URLSearchParams();
        if (englishPreferred) params.set("eng", "true");
        const query = params.toString();
        const url = `/sunday/${planId}` + (query ? `?${query}` : "");

        if (page.url.pathname + page.url.search === url) return;

        goto(url, {
            replaceState: true,
            noScroll: true,
            keepFocus: true,
            invalidateAll: false,
        });
    });

    $effect(() => {
        const url = page.url.href;

        QRCode.toDataURL(url)
            .then((data: any) => {
                qrUrl = data;
            })
            .catch((err: any) => {
                console.error("QR generation failed", err);
            });
    });

    // Fetches the id of the sunday service service type
    async function fetchSundayServiceType(): Promise<string> {
        const raw = await fetch("/api/pco/service_types"); // should fetch this 1329064 but rather than hardcode that, we fetch that as it might change later
        const data: any = await raw.json(); // TODO FIXME make this type-safe
        return data.data[0].id;
    }

    // Fetches the plan of the next sunday
    async function fetchNextSundayPlan(serviceType: string) {
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

    async function fetchPlans(serviceType: string) {
        const raw = await fetch(`/api/pco/service_types/${serviceType}/plans`);
        const data: any = await raw.json(); // TODO FIXME make this type-safe
        return data;
    }

    // Fetches the plans for the sunday service
    async function fetchSundayPlanItems(serviceType: string, planId: string) {
        const raw = await fetch(
            `/api/pco/service_types/${serviceType}/plans/${planId}/items`,
        );
        const data: any = await raw.json(); // TODO FIXME make this type-safe
        return data;
    }

    onMount(async () => {
        try {
            loadingMesage = "Looking for next sunday...";
            const serviceType = await fetchSundayServiceType();

            let resolvedPlanId: string;

            if (planId) {
                resolvedPlanId = planId;
            } else {
                loadingMesage = "Fetching sunday service plan...";
                const plan = await fetchNextSundayPlan(serviceType);
                resolvedPlanId = plan.id;

                // Reflect resolved plan in the URL, same pattern as songs page
                const params = new URLSearchParams();
                if (eng) params.set("eng", "true");
                const query = params.toString();
                goto(`/sunday/${resolvedPlanId}` + (query ? `?${query}` : ""), {
                    replaceState: true,
                });
            }

            loadingMesage = "Loading songs from the sunday plan...";
            const items = await fetchSundayPlanItems(
                serviceType,
                resolvedPlanId,
            );
            loadingMesage = "Almost done, hang tight...";
            serviceItems = items.data;
            loading = false;

            console.log(fetchPlans(serviceType));
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
<div class="flex items-center justify-between mt-2 mb-4">
    <div class="text-sm text-muted-foreground">Sunday playlist items</div>
    <div class="flex items-center gap-2">
        <div class="flex items-center gap-3">
            <Checkbox id="terms" bind:checked={englishPreferred} />
            <Label for="terms">Prefer english translations when possible</Label>
        </div>
    </div>
</div>

<Calendar
    label="Select sunday"
    bind:value={selectedDate}
    startDate={new CalendarDate(2024, 1, 1)}
    endDate={today(getLocalTimeZone())}
    allowedDays={[0]}
/>

<AlertDialog.Root>
    <AlertDialog.Trigger class={buttonVariants({ variant: "outline" })}>
        <QrCodeIcon /> Share this page
    </AlertDialog.Trigger>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Share this QR code</AlertDialog.Title>
            <AlertDialog.Description>
                <p>Scanning this QR code will take you to this page.</p>
                <p>
                    <em
                        >{englishPreferred
                            ? "Note: 'Prefer english translations' is selected. The QR code will retain this option when shared. If you don't want that, unselect the option."
                            : ""}</em
                    >
                </p>
            </AlertDialog.Description>
            {#if qrUrl}
                <img
                    src={qrUrl}
                    alt="QR code for current page"
                    class="w-full"
                />
            {:else}
                <p>Generating QR code...</p>
            {/if}
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Close</AlertDialog.Cancel>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

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
{:else if serviceItems!.filter((i) => i.attributes.item_type === "song").length > 0}
    {#each serviceItems as item}
        {#if item.attributes.item_type === "song"}
            <Item.Root
                variant="muted"
                onclick={() =>
                    goto(
                        `/songs/${item.relationships.song.data.id}/${item.relationships.arrangement.data.id}?key=${item.relationships.key.data.id}${eng ? "&eng=true" : ""}`,
                    )}
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
