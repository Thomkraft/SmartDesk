<script>
    import { selDate, calendarData } from "./store.js";
    import { getMonthName } from "./date-helpers.js";
    import Event from "$lib/Event.svelte";
    import {onMount} from "svelte";


    // Initialize selected date
    const selectedDate = $selDate;

    // Initialize header title
    const headerTitle =
        getMonthName(selectedDate) + " " +
        selectedDate.getDate();

    // Create new event
    let eventMenuContainer;
    let createEventContainer;
    let createEventBtn;

    let titleEvent;
    let startDateEvent
    let endDateEvent;
    let startTimeEvent;
    let endTimeEvent;
    let descriptionEvent;

    async function registerEvent() {

        const currentUserId = localStorage.getItem("id");

        try {
            const response = await fetch("/events/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    userId: currentUserId,
                    title: titleEvent,
                    startDate: startDateEvent,
                    endDate: endDateEvent,
                    startTime: startTimeEvent,
                    endTime: endTimeEvent,
                    description: descriptionEvent,
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch events');
        }
        catch (error) {
            console.error(error);
        }
    }
</script>

<div id="event-menu" class="hidden max-lg:fixed max-lg:border-l-2 max-lg:border-gray-300 w-full max-w-md h-full right-0 bg-gray-50 transition-all duration-500 ease-out">
    <div id="event-menu-header" class="text-md text-center border-b-2 border-gray-300 py-3">
        <h1>{headerTitle} events</h1>
    </div>

    <div id="event-menu-container" bind:this={eventMenuContainer} class="text-center">

        {#if $calendarData.length > 0}
            {#each $calendarData[selectedDate.getDate() + 1].events as event}
                <Event
                        title={event.title}
                        startDate={event.startDate}
                        endDate={event.endDate}
                        startTime={event.startTime}
                        endTime={event.endTime}
                        description={event.description}
                />
            {/each}
        {/if}

        <input type="button" id="create-event-btn" bind:this={createEventBtn}
               class="bg-teal-400 text-gray-50 rounded-md text-center my-5 px-3 py-1" value="New Event"
               on:click={() => {
                eventMenuContainer.classList.add("hidden");
                createEventContainer.classList.remove("hidden");
                console.log("test");}}
        />
    </div>

    <div id="create-event-container" bind:this={createEventContainer} class="hidden flex flex-col m-5">

        <input id="event-title-tf" bind:this={titleEvent} type="text" placeholder="Title" class="text-md p-3 bg-gray-300 rounded-t-md outline-none" />

        <div id="date-selector" class="flex flex-col bg-gray-300 w-full">
            <label class="flex items-center justify-between px-3">
                Start date
                <input id="event-start-date" bind:this={startDateEvent} type="date" class="text-md py-3 items-end bg-gray-300 outline-none" />
            </label>
            <label class="flex items-center justify-between px-3">
                End date
                <input id="event-end-date" bind:this={endDateEvent} type="date" class="text-md py-3 bg-gray-300 outline-none" />
            </label>
        </div>

        <div id="time-selector" class="flex flex-col bg-gray-300 w-full">
            <label class="flex items-center justify-between px-3">
                Start time
                <input id="event-start-time" bind:this={startTimeEvent} type="time" class="text-md py-3 items-end bg-gray-300 outline-none" />
            </label>
            <label class="flex items-center justify-between px-3">
                End time
                <input id="event-end-time" bind:this={endTimeEvent} type="time" class="text-md py-3 bg-gray-300 outline-none" />
            </label>
        </div>

        <input id="event-desc-tf" bind:this={descriptionEvent} type="text" placeholder="Description" class="text-md p-3 bg-gray-300 rounded-b-md outline-none" />

        <div id="create-event-btn-container" class="flex justify-center space-x-2 my-5">
            <input
                    id="cancel-event-btn" type="button" value="Cancel" class="border-[1px] border-black px-3 py-2 rounded-md"
                    on:click={() => {
                        createEventContainer.classList.add("hidden");
                        eventMenuContainer.classList.remove("hidden");
                    }}
            />
            <input
                    id="create-event-btn" type="button" value="Save" class="text-gray-100 bg-teal-400 px-4 py-2 rounded-md"
                    on:click={() => {
                        registerEvent();
                    }}
            />
        </div>

    </div>
</div>


