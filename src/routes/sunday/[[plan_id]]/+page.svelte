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
        parseDate,
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
    let plans = $state<any[]>([]);
    let serviceType = $state<string | null>(null);

    const availableDates = $derived(
        plans.map((p) => parseDate(p.attributes.sort_date.split("T")[0])),
    );

    $effect(() => {
        englishPreferred = eng;
    });

    $effect(() => {
        if (!planId) return;
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

    // Navigate to plan when a date is picked in the calendar
    $effect(() => {
        if (!selectedDate) return;

        const match = plans.find((p) =>
            p.attributes.sort_date.startsWith(selectedDate!.toString()),
        );

        if (!match || match.id === planId) return;

        const params = new URLSearchParams();
        if (eng) params.set("eng", "true");
        const query = params.toString();
        goto(`/sunday/${match.id}` + (query ? `?${query}` : ""), {
            replaceState: true,
        });
    });

    $effect(() => {
        QRCode.toDataURL(page.url.href)
            .then((data: any) => {
                qrUrl = data;
            })
            .catch((err: any) => {
                console.error("QR generation failed", err);
            });
    });

    async function fetchSundayServiceType(): Promise<string> {
        const raw = await fetch("/api/pco/service_types");
        const data: any = await raw.json();
        return data.data[0].id;
    }

    async function fetchNextSundayPlan(serviceType: string) {
        const raw = await fetch(`/api/pco/service_types/${serviceType}/plans`);
        const data: any = await raw.json();
        const { start, end } = getNextSundayRange(new Date());
        const filtered = data.data.filter((p: any) =>
            isInRange(p.attributes.sort_date, start, end),
        );

        if (!Array.isArray(filtered) || filtered.length === 0) {
            throw new Error("No plans found for the next sunday");
        }

        return filtered[0];
    }

    async function fetchPlans(serviceType: string) {
        const raw = await fetch(`/api/pco/service_types/${serviceType}/plans`);
        const data: any = await raw.json();
        return data.data;
    }

    async function fetchSundayPlanItems(serviceType: string, id: string) {
        const raw = await fetch(
            `/api/pco/service_types/${serviceType}/plans/${id}/items`,
        );
        const data: any = await raw.json();
        return data;
    }

    // Runs once — resolves service type and, if needed, auto-detects the plan
    onMount(async () => {
        try {
            loadingMesage = "Looking for next sunday...";
            const type = await fetchSundayServiceType();
            serviceType = type;

            const allPlans = await fetchPlans(type);
            plans = allPlans;

            if (!planId) {
                loadingMesage = "Fetching sunday service plan...";
                const plan = await fetchNextSundayPlan(type);

                const params = new URLSearchParams();
                if (eng) params.set("eng", "true");
                const query = params.toString();
                goto(`/sunday/${plan.id}` + (query ? `?${query}` : ""), {
                    replaceState: true,
                });
                // the effect below will take over from here once planId updates
            }
        } catch (err) {
            error = err instanceof Error ? err.message : "Unknown error";
            loading = false;
        }
    });

    // Re-runs whenever planId changes (including after goto above)
    $effect(() => {
        if (!planId || !serviceType) return;

        const currentPlan = plans.find((p) => p.id === planId);
        if (currentPlan) {
            selectedDate = parseDate(
                currentPlan.attributes.sort_date.split("T")[0],
            );
        }

        loading = true;
        error = null;
        loadingMesage = "Loading songs from the sunday plan...";

        fetchSundayPlanItems(serviceType, planId)
            .then((items) => {
                serviceItems = items.data;
                loadingMesage = "Almost done, hang tight...";
                loading = false;
            })
            .catch((err) => {
                error = err instanceof Error ? err.message : "Unknown error";
                loading = false;
            });
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
    {availableDates}
    disabled={loading}
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
