<script>
    import { selDate } from "./store.js";
    import { getMonthName } from "./date-helpers.js";

    // Initialize selected date
    let selectedDate = $selDate;

    // Initialize header title
    const headerTitle =
        getMonthName(selectedDate) + " " +
        selectedDate.getDate();

</script>

<div id="event-menu" class="hidden max-lg:fixed max-lg:border-l-2 max-lg:border-gray-300 w-full max-w-md h-full right-0 bg-gray-50 transition-all duration-500 ease-out">
    <div id="event-menu-header" class="text-md text-center border-b-2 border-gray-300 py-3">
        <h1>{headerTitle} events</h1>
    </div>

    <div id="event-menu-container" class="text-center">

        <input type="button" id="create-event"
               class="bg-teal-400 text-gray-50 rounded-md text-center my-5 px-3 py-1" value="New Event"/>

    </div>
</div>


