<script>
    import { recoverCalendarEvents } from "$lib/data-calendar.js";
    import { calendarData } from "$lib/store.js";


    export let eventId = "Event ID";
    export let title = "Title";
    export let startDate = "Start date";
    export let endDate = "End date";
    export let startTime = "Start time";
    export let endTime = "End time";
    export let description = "Description";

    // Delete event button
    async function deleteEvent() {

        const currentUserId = localStorage.getItem("id");

        try {
            const response = await fetch("/events/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    action: "deleteEvent",
                    eventId: eventId,
                    userId: currentUserId,
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch events');

            // Reload page
            window.location.reload();
        }
        catch (error) {
            console.error(error);
        }
    }

</script>

<div id="event-container" class="text-left m-3 p-5 bg-gray-300 rounded-md">
    <div id="event-header" class="flex items-center justify-between">
        <h1 class="text-lg font-bold">{title}</h1>
        <input
                id="delete-event-btn" type="button" value="X" class="text-lg px-2 hover:bg-red-700 hover:bg-opacity-20 rounded-full"
                on:click={deleteEvent}
        />
    </div>

    <h2 class="font-bold">{startDate} - {startTime} > {endDate} - {endTime}</h2>
    <p>{description}</p>
</div>
