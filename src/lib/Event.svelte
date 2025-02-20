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

<div id="event-container" class="flex text-left p-4">
    <div class="flex items-center">
        <div>
            <!-- <p class="font-bold mb-1">{startDate}</p> -->
            <p class="font-bold mb-1">{startTime}</p>
            <p class="font-bold mb-1">{endTime}</p>
        </div>
    </div>


    <span class="border-2 border-teal-400 mx-5 my-1 rounded-full"></span>

    <div id="event-main" class="flex flex-col w-full">
        <div class="flex justify-between">
            <h1 class="text-lg font-bold">{title}</h1>
            <input
                    id="delete-event-btn" type="button" value="X" class="text-lg px-2 hover:bg-red-700 hover:bg-opacity-20 rounded-full"
                    on:click={deleteEvent}
            />
        </div>

        <p>{description}</p>
    </div>
</div>
