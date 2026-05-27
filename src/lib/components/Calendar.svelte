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
        endDate = today(getLocalTimeZone()),

        // allowed weekdays: 0 = Sunday ... 6 = Saturday
        allowedDays,
    }: {
        label: string;
        value: CalendarDate | undefined;

        startDate?: CalendarDate;
        endDate?: CalendarDate;

        allowedDays?: number[];
    } = $props();

    const id = $props.id();

    let open = $state(false);

    function isDateUnavailable(date: DateValue) {
        if (!allowedDays || allowedDays.length === 0) {
            return false;
        }

        const jsDate = date.toDate(getLocalTimeZone());

        return !allowedDays.includes(jsDate.getDay());
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
                captionLayout="dropdown"
                minValue={startDate}
                maxValue={endDate}
                {isDateUnavailable}
                onValueChange={() => {
                    open = false;
                }}
            />
        </Popover.Content>
    </Popover.Root>
</div>
