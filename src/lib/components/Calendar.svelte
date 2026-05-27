<script lang="ts">
    import Calendar from "$lib/components/ui/calendar/calendar.svelte";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import {
        getLocalTimeZone,
        today,
        type CalendarDate,
        type DateValue,
    } from "@internationalized/date";

    let {
        label,
        value = $bindable(),
        startDate,
        endDate,
        allowedDays,
        availableDates,
        disabled,
    }: {
        label: string;
        value: CalendarDate | undefined;
        startDate?: CalendarDate;
        endDate?: CalendarDate;
        allowedDays?: number[];
        availableDates?: CalendarDate[];
        disabled?: boolean;
    } = $props();

    const id = $props.id();
    let open = $state(false);
    let placeholder = $state(value ?? today(getLocalTimeZone()));

    $effect(() => {
        if (value) placeholder = value;
    });

    const minValue = $derived.by(() => {
        if (startDate) return startDate;
        if (availableDates?.length) {
            return availableDates.reduce((min, d) =>
                d.compare(min) < 0 ? d : min,
            );
        }
        return undefined;
    });

    const maxValue = $derived.by(() => {
        if (endDate) return endDate;
        if (availableDates?.length) {
            return availableDates.reduce((max, d) =>
                d.compare(max) > 0 ? d : max,
            );
        }
        return undefined;
    });

    function isDateUnavailable(date: DateValue) {
        if (availableDates && availableDates.length > 0) {
            return !availableDates.some((d) => d.compare(date) === 0);
        }
        if (allowedDays && allowedDays.length > 0) {
            return !allowedDays.includes(
                date.toDate(getLocalTimeZone()).getDay(),
            );
        }
        return false;
    }
</script>

<div class="flex flex-col gap-3">
    <Label for="{id}-date" class="px-1">
        {label}
    </Label>
    <Popover.Root bind:open>
        <Popover.Trigger id="{id}-date">
            {#snippet child({ props })}
                <Button
                    {...props}
                    variant="outline"
                    class="w-48 justify-between font-normal"
                    {disabled}
                >
                    {value
                        ? value.toDate(getLocalTimeZone()).toLocaleDateString()
                        : "Select date"}
                    <ChevronDownIcon />
                </Button>
            {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-auto overflow-hidden p-0" align="start">
            <Calendar
                type="single"
                bind:value
                bind:placeholder
                captionLayout="dropdown"
                {minValue}
                {maxValue}
                {isDateUnavailable}
                onValueChange={() => {
                    open = false;
                }}
                {disabled}
            />
        </Popover.Content>
    </Popover.Root>
</div>
