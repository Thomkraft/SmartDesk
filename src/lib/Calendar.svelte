<script>
    import {onMount} from "svelte";
    import {isWeekend, getDayName} from "./date-helpers.js";

    let calendar;

    onMount(() => {
        calendar = document.getElementById("calendar");

        // Display all days name
        for (let day = 1; day <= 7; day++) {

            const dayName = getDayName(day);

            calendar.insertAdjacentHTML("beforeend",
                `<div class="
                    dayName
                    text-center py-3 font-semibold border-b-2 border-gray-300">
                    ${dayName}</div>`
            );
        }

        // Add all days of the month
        for (let day = 1; day <= 31; day++) {

            // Get de name of the current day
            //const dayName = getDayName(day);

            // Test if the current day is a weekend
            const weekend = isWeekend(day);

            // Insert the day into the DOM tree
            calendar.insertAdjacentHTML(
                "beforeend",
                `<div class="
                    day
                    ${weekend ? "text-blue-400" : ""}
                    text-center pt-2 pb-16 border-r-2 border-b-2 border-gray-300">
                    ${day}</div>`
            );
        }

        // Option to select one or more days
        document.querySelectorAll("#calendar .day").forEach
        (day => {
            day.addEventListener("click", event => {
                event.currentTarget.classList.toggle("bg-blue-300");
            });
        });

    });
</script>

<div id="calendar" class="grid grid-cols-7 bg-gray-100"></div>