<script>
    import { onMount } from "svelte";
    import { toDate, selDate, calendarData } from "./store.js";
    import { isCurrentDay, isWeekend, getDayName, getMonthName } from "./date-helpers.js";
    import { generateCalendarData, recoverCalendarEvents, containsEvents } from "./data-calendar.js";
    import { toggleEventMenu } from "./calendar-animation.js";
    import EventMenu from "$lib/EventMenu.svelte";
    import Event from "$lib/Event.svelte";


    let calendarNav;
    let calendarDaysName;
    let calendar;
    //let calendarData = [];
    let eventMenuComponent;
    let showEventMenu = false;

    // Initialize current date
    let todayDate = $toDate;
    let selectedDate = $selDate;

    // General properties
    const windowWidthMax = 766;
    let eventMenuHeaderTitle;

    onMount(() => {
        // Update data of the calendar
        $calendarData = generateCalendarData(todayDate);

        // Recover month events
        const calendarDataPromise = recoverCalendarEvents($calendarData);

        calendarDataPromise.then((monthData) => {
            $calendarData = monthData;
            updateCalendar()

        }).catch((err) => {
            console.log(err);
        })

        calendar = document.getElementById("calendar");

        // Get current month name
        calendarNav = document.getElementById("calendar-nav");
        const btnPrevMonth = calendarNav.querySelector("#prev-month");
        const btnNextMonth = calendarNav.querySelector("#next-month");
        const labMonth = calendarNav.querySelector("#lab-month");

        labMonth.textContent = getMonthName(todayDate);
        //console.log(labMonth.textContent);

        // Choose month
        btnPrevMonth.addEventListener("click", () => {
            //console.log("test previous");
            todayDate.setMonth(todayDate.getMonth() - 1);
            toDate.set(todayDate);

            $calendarData = generateCalendarData(todayDate);
            recoverEvents();
            updateCalendar();
        })

        btnNextMonth.addEventListener("click", () => {
            //console.log("test next");
            todayDate.setMonth(todayDate.getMonth() + 1);
            toDate.set(todayDate);

            $calendarData = generateCalendarData(todayDate);
            recoverEvents();
            updateCalendar();
        })

        // Back to the today month
        const btnTodayMonth = calendarNav.querySelector("#today-month");

        btnTodayMonth.addEventListener("click", () => {
            todayDate = new Date(Date.now());
            toDate.set(todayDate);
            //selectedDate = todayDate;

            $calendarData = generateCalendarData(todayDate);
            recoverEvents();
            updateCalendar();
        })

        // Display all days name
        calendarDaysName = document.getElementById("days-name");

        for (let day = 1; day <= 7; day++) {

            const dayName = getDayName(day);

            calendarDaysName.insertAdjacentHTML("beforeend",
                `<div class="
                    dayName
                    text-center py-3 font-semibold border-b-2 border-gray-300">
                    ${dayName}</div>`
            );
        }

        // Update UI Calendar
        updateCalendar()

        // Recover events of the current month
        async function recoverEvents() {
            // Recover month events
            const calendarDataPromise = recoverCalendarEvents($calendarData);

            calendarDataPromise.then((monthData) => {
                $calendarData = monthData;
                updateCalendar();

            }).catch((err) => {
                console.log(err);
            })
        }

        // Update the calendar when select next or previous month
        function updateCalendar() {

            // Update month name
            labMonth.textContent = getMonthName(todayDate) + ", " + todayDate.getFullYear();
            //console.log("LABMONTH : " + labMonth.textContent);

            // Clear calendar
            calendar.innerHTML = "";

            // Get information on the current month
            const year = todayDate.getFullYear();
            const month = todayDate.getMonth() + 1;

            let firstDayIndex = new Date(year + "-" + month + "-01").getDay();

            // Adjust index for french week notation (mon - sun : 1 - 7)
            if (firstDayIndex === 0) {
                firstDayIndex = 7;
            }

            const lastDayIndex = new Date(year, month, 0).getDate() + firstDayIndex;
            //console.log("FIRST DAY : " + firstDayIndex + " LAST DAY : " + lastDayIndex);

            // Add all days of the month
            for (let day = 0; day < 35; day++) {
                const dayNumber = $calendarData[day].day;
                const dayMonth = $calendarData[day].month;
                const dayYear = $calendarData[day].year;

                // Update the date of the day
                const dayDate = new Date(dayYear + "-" + dayMonth + "-" + dayNumber);

                // Test if the day is the current day
                const currentDay = isCurrentDay(dayDate);

                // Test if the day is a weekend
                const weekend = isWeekend(day + 1);

                // Test if the day contains events
                //let hasEvents = $calendarData[day]?.events && $calendarData[day].events.length > 0;
                const nbEvents = $calendarData[day].events.length;

                // Insert the day into the DOM tree
                calendar.insertAdjacentHTML(
                    "beforeend",
                    `<div class="day ${weekend ? `${currentDay ? 'text-blue-700' : ' text-blue-400'}` : ""}
                        flex flex-col justify-center text-center border-r-2 border-b-2 border-gray-300 select-none">

                        <div class="${currentDay ? "self-center px-3 py-2 bg-teal-400 rounded-full" : "px-2 py-1"} relative">
                            <p>${dayNumber}</p>

                            ${nbEvents > 0 ? `<span class="${currentDay ? "bg-white" : "bg-teal-500"}
                            mt-0.5 absolute -translate-x-1/2 w-1.5 h-1.5 rounded-full m-auto"></span>` : ""}
                        </div>
                    </div>`
                );
            }

            // Option to select one or more days
            const allDays = document.querySelectorAll("#calendar .day");

            allDays.forEach((dayElement, index) => {
                dayElement.addEventListener("click", () => {
                    // Open event menu on second click
                    console.log(window.innerWidth)
                    if ($calendarData[index].selected && window.innerWidth < windowWidthMax) {

                        toggleEventMenu();

                        showEventMenu = true;

                        // Apply CSS to selected day
                    } else {
                        // Set selected date
                        selectedDate.setDate($calendarData[index].day);
                        selectedDate.setMonth($calendarData[index].month - 1);
                        selectedDate.setFullYear($calendarData[index].year);
                        selDate.set(selectedDate);

                        // Update date of event menu
                        updateEventMenu();

                        // Reset selection
                        $calendarData.forEach(day => day.selected = false);

                        // Mark selected day
                        $calendarData[index].selected = true;

                        // Apply CSS
                        allDays.forEach(d => d.classList.remove("bg-gray-200"));
                        dayElement.classList.add("bg-gray-200");

                        showEventMenu = false;
                    }
                });
            });
        }

        // Update date of event menu header
        function updateEventMenu() {
            // Display date on event menu header
            const eventMenuHeader = document.getElementById("event-menu-header");
            eventMenuHeaderTitle =
                getMonthName(selectedDate) + " " +
                selectedDate.getDate();

            //eventMenuHeader.innerHTML = `<h1>${headerTitle} events</h1>`;

            // Display date one date field create event
            const startDateEvent = document.getElementById("event-start-date")
            const endDateEvent = document.getElementById("event-end-date")

            let formatedSelDate = $selDate.toLocaleDateString('en-US').split("/");
            formatedSelDate = `${formatedSelDate[2]}-${('0'+formatedSelDate[0]).slice(-2)}-${('0'+formatedSelDate[1]).slice(-2)}`;

            startDateEvent.value = formatedSelDate;
            endDateEvent.value = formatedSelDate;
        }

        // // Update elements on start
        // updateCalendar();
    });
</script>

<div class="bg-gray-50 w-full h-full flex flex-col">
    <div id="calendar-header" class="border-r-2 border-gray-300">
        <div id="calendar-nav" class="flex justify-between items-center px-10 py-4 pb-2">

            <div class="col-span-1 text-center">
                <input type="button" id="today-month"
                       class="border border-gray-800 rounded-md text-left px-3 py-1" value="Today"/>
            </div>

            <p id="lab-month" class="col-span-1 text-center">Month</p>

            <div class="col-span-1 text-center">

                <input type="button" id="prev-month" value="<"
                       class="border border-gray-800 rounded-md px-3 py-1"/>


                <input type="button" id="next-month" value=">"
                       class="border border-gray-800 rounded-md px-3 py-1"/>

            </div>
        </div>

        <div id="days-name" class="grid grid-cols-7"></div>
    </div>

    <div id="calendar" class="grid grid-cols-7 flex-grow max-w"></div>

</div>

<EventMenu bind:this={eventMenuComponent} bind:headerTitle={eventMenuHeaderTitle} />











