<script>
    import {onMount} from "svelte";
    import {isCurrentDay, isWeekend, getDayName, getMonthName} from "./date-helpers.js";
    import {generateCalendarData} from "./data-calendar.js";
    import EventMenu from "$lib/EventMenu.svelte";

    let calendarNav;
    let calendarDaysName;
    let calendar;
    let calendarData = [];
    let showEventMenu = false;

    // Initialize current date
    let currentDate = new Date(Date.now());

    onMount(() => {
        calendar = document.getElementById("calendar");

        // Get current month name
        calendarNav = document.getElementById("calendar-nav");
        const btnPrevMonth = calendarNav.querySelector("#prev-month");
        const btnNextMonth = calendarNav.querySelector("#next-month");
        const labMonth = calendarNav.querySelector("#lab-month");

        labMonth.textContent = getMonthName(currentDate, 0);
        console.log(labMonth.textContent);

        // Choose month
        btnPrevMonth.addEventListener("click", () => {
            console.log("test previous");
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateCalendar();
        })

        btnNextMonth.addEventListener("click", () => {
            console.log("test next");
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateCalendar();
        })

        // Back to the today month
        const btnTodayMonth = calendarNav.querySelector("#today-month");

        btnTodayMonth.addEventListener("click", () => {
            console.log("test today");
            currentDate = new Date(Date.now());
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

        // Update the calendar when select next or previous month
        function updateCalendar() {
            // Update data of the calendar
            calendarData = generateCalendarData(currentDate, calendarData);
            console.log(calendarData);

            // Update month name
            labMonth.textContent = getMonthName(currentDate) + ", " + currentDate.getFullYear();

            // Clear calendar
            calendar.innerHTML = "";

            // Get information on the current month
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            let firstDayIndex = new Date(year + "-" + month + "-01").getDay();

            // Adjust index for french week notation (mon - sun : 1 - 7)
            if (firstDayIndex === 0) {
                firstDayIndex = 7;
            }

            const lastDayIndex = new Date(year, month, 0).getDate() + firstDayIndex;
            console.log("FIRST DAY : " + firstDayIndex + " LAST DAY : " + lastDayIndex);

            // Add all days of the month
            for (let day = 0; day <= 34; day++) {
                const dayNumber = calendarData[day].day;
                const dayMonth = calendarData[day].month;
                const dayYear = calendarData[day].year;

                // Update the date of the day
                const dayDate = new Date(dayYear + "-" + dayMonth + "-" + dayNumber);

                // Test if the day is the current day
                const currentDay = isCurrentDay(dayDate);

                // Test if the day is a weekend
                const weekend = isWeekend(day + 1);

                // Insert the day into the DOM tree
                calendar.insertAdjacentHTML(
                    "beforeend",
                    `<div class="day ${weekend ? `${currentDay ? 'text-blue-700' : ' text-blue-400'}` : ""}
                    flex justify-center text-center pt-2 pb-2 border-r-2 border-b-2 border-gray-300 select-none">
                        <p class="${currentDay ? " self-start min-w-8 px-2 py-1 bg-teal-400 rounded-full" : "px-2 py-1"}">${dayNumber}</p>
                    </div>`
                );
            }

            // Option to select one or more days
            const allDays = document.querySelectorAll("#calendar .day");

            allDays.forEach((dayElement, index) => {
                dayElement.addEventListener("click", () => {
                    // Open event menu on second click
                    if (calendarData[index].selected) {
                        const eventMenu = document.getElementById("event-menu");
                        showEventMenu = true;

                        console.log(eventMenu);
                        console.log("second click");

                        // Apply CSS to selected day
                    } else {
                        // Reset selection
                        calendarData.forEach(day => day.selected = false);

                        // Mark selected day
                        calendarData[index].selected = true;

                        // Apply CSS
                        allDays.forEach(d => d.classList.remove("bg-gray-200"));
                        dayElement.classList.add("bg-gray-200");

                        showEventMenu = false;

                        console.log("first click");
                    }
                });
            });
        }

        updateCalendar();
    });
</script>

<div class="bg-gray-50 w-full h-full flex flex-col">
    <div id="calendar-nav" class="grid grid-cols-7 items-center py-4 pb-2">

        <div class="col-start-1 text-center">

            <input type="button" id="today-month"
                   class="border border-gray-800 rounded-md text-left px-3 py-1" value="Today" />

        </div>

        <p id="lab-month" class="col-start-3 col-end-6 text-center">Month</p>

        <div class="col-start-7 text-center">

            <input type="button" id="prev-month" value="<"
                   class="border border-gray-800 rounded-md px-3 py-1" />

            <input type="button" id="next-month" value=">"
                   class="border border-gray-800 rounded-md px-3 py-1" />

        </div>

    </div>

    <div id="days-name" class="grid grid-cols-7"></div>

    <div id="calendar" class="grid grid-cols-7 flex-grow max-w"></div>

</div>

{#if showEventMenu}
    <EventMenu />
{/if}







