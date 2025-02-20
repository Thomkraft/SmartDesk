<script>
    import { selDate, calendarData, notification, isConnected } from "./store.js";
    import { getMonthName } from "./date-helpers.js";
    import Event from "$lib/Event.svelte";
    import ArrowLeftIcon from "$lib/assets/icons/arrow_left_icon.svg";
    import Notification from "$lib/Notification.svelte";
    import {goto} from "$app/navigation";
    import {toggleEventMenu} from "$lib/calendar-animation.js";


    let eventMenu;

    let eventMenuContainer;
    let createEventContainer;
    let createEventForm;
    let createEventBtn;

    let titleEvent;
    let startDateEvent
    let endDateEvent;
    let startTimeEvent;
    let endTimeEvent;
    let descriptionEvent;
    

    // Initialize selected date
    const selectedDate = $selDate;

    // Initialize header title
    export let headerTitle =
        getMonthName(selectedDate) + " " +
        selectedDate.getDate();

    // Arrow left function on click
    const arrowLeftAction = () => {
        toggleEventMenu()
        switchMenu("events");
    }

    // Switch event menu and create event menu
    const switchMenu = (type) => {
        if (type === "events") {
            createEventContainer.classList.add("hidden");
            eventMenuContainer.classList.remove("hidden");
        }

        else if (type === "create") {
            eventMenuContainer.classList.add("hidden");
            createEventContainer.classList.remove("hidden");
        }
    }

    async function registerEvent() {
        const currentUserId = localStorage.getItem("id");

        try {
            if (!titleEvent || !startDateEvent || !endDateEvent || !startTimeEvent || !endTimeEvent || !descriptionEvent) {
                console.error("One or more input elements are not initialized.");
                return;
            }

            // Control data
            titleEvent = titleEvent.value;
            startDateEvent = startDateEvent.value;
            endDateEvent = endDateEvent.value;
            startTimeEvent = startTimeEvent.value;
            endTimeEvent = endTimeEvent.value;
            descriptionEvent = descriptionEvent.value;

            if (titleEvent.length > 20) {
                notification.set({
                    show: true,
                    message: 'Title must not exceed 20 characters',
                    type: 'alert'
                });

                throw new Error("Title must not exceed 20 characters")
            }

            // if (endDateEvent < startDateEvent) {
            //     notification.set({
            //         show: true,
            //         message: 'End date must be greater than start date',
            //         type: 'alert'
            //     });
            //
            //     throw new Error("End date must be greater than start date")
            // }

            const response = await fetch("/events/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    action: "createEvent",
                    userId: currentUserId,
                    title: titleEvent,
                    startDate: startDateEvent,
                    endDate: endDateEvent,
                    startTime: startTimeEvent,
                    endTime: endTimeEvent,
                    description: descriptionEvent,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            // Reload page
            window.location.reload();
        }
        catch (error) {
            console.error(error);
        }
    }

    $: dayIndex = $calendarData.findIndex(day =>
        day.day === selectedDate.getDate() &&
        day.month === (selectedDate.getMonth() + 1) &&
        day.year === selectedDate.getFullYear()
    );

</script>

<div id="event-menu" bind:this={eventMenu} class="max-md:hidden max-md:fixed border-l-2 border-gray-300 w-full max-w-md h-full right-0 bg-gray-50 transition-all duration-500 ease-out">

    <div id="event-menu-header" class="max-md:grid grid-cols-3 text-md border-b-2 border-gray-300 py-3">
        <div class="md:hidden text-left">
            <button class="flex items-center" on:click={ arrowLeftAction }>
                <img class="w-8 p-1 mx-1 hover:bg-gray-200 rounded-full" src={ArrowLeftIcon} alt="arrow_left" />
            </button>
        </div>

        <h1 class="flex justify-center items-center">{headerTitle} events</h1>
    </div>


    <div id="event-menu-container" bind:this={eventMenuContainer} class="text-center">

        {#if $calendarData.length > 0 && dayIndex !== -1}
            {#each $calendarData[dayIndex].events as event}
                <Event
                        eventId={event.idEvent}
                        title={event.title}
                        startDate={event.startDate}
                        endDate={event.endDate}
                        startTime={event.startTime}
                        endTime={event.endTime}
                        description={event.description}
                />
            {/each}
        {/if}

        <button
                class="mt-5"
                id="create-event-btn" bind:this={createEventBtn}
                aria-label="New Event"
                on:click={() => {
                    if ($isConnected) {
                        switchMenu("create");
                    }
                    else {
                        goto("/page-account");
                    }
               }}
        >
            <svg class="fill-gray-50 bg-teal-400 rounded-full w-8 h-8" xmlns="http://www.w3.org/2000/svg" height="300px" viewBox="0 -960 960 960" width="300px">
                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
            </svg>
        </button>
    </div>

    <div id="create-event-container" bind:this={createEventContainer} class="hidden flex flex-col m-5">

        <form id="create-event-form" bind:this={createEventForm} on:submit|preventDefault={registerEvent}>
            <input id="event-title-tf" bind:this={titleEvent} type="text" placeholder="Title" maxlength="20" required class="text-md w-full p-3 bg-gray-300 rounded-t-md outline-none" />

            <div id="date-selector" class="flex flex-col bg-gray-300 w-full">
                <label class="flex items-center justify-between px-3">
                    Start date
                    <input id="event-start-date" bind:this={startDateEvent} type="date" required class="text-md py-3 items-end bg-gray-300 outline-none" />
                </label>

                <label class="flex items-center justify-between px-3">
                    End date
                    <input id="event-end-date" bind:this={endDateEvent} type="date" required class="text-md py-3 bg-gray-300 outline-none" />
                </label>
            </div>

            <div id="time-selector" class="flex flex-col bg-gray-300 w-full">
                <label class="flex items-center justify-between px-3">
                    Start time
                    <input id="event-start-time" bind:this={startTimeEvent} type="time" required class="text-md py-3 items-end bg-gray-300 outline-none" />
                </label>

                <label class="flex items-center justify-between px-3">
                    End time
                    <input id="event-end-time" bind:this={endTimeEvent} type="time" required class="text-md py-3 bg-gray-300 outline-none" />
                </label>
            </div>

            <input id="event-desc-tf" bind:this={descriptionEvent} type="text" placeholder="Description" maxlength="1000" class="text-md w-full p-3 bg-gray-300 rounded-b-md outline-none" />

            <div id="create-event-btn-container" class="flex justify-center space-x-2 my-5">
                <input
                        id="cancel-event-btn" type="button" value="Cancel" class="border-[1px] border-black px-3 py-2 rounded-md"
                        on:click={() => {
                            switchMenu("events")
                        }}
                />
                <input
                        id="save-event-btn" type="submit" value="Save" class="text-gray-100 bg-teal-400 px-4 py-2 rounded-md"
                />
            </div>
        </form>
    </div>
</div>

<Notification />


