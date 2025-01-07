<script>
    export let title = "Title";
    export let startDate = "Start date";
    export let endDate = "End date";
    export let startTime = "Start time";
    export let endTime = "End time";
    export let description = "Description";

</script>

<div id="event-container" class="text-left m-3 p-5 bg-gray-300 rounded-md">
    <h1 class="text-lg font-bold">{title}</h1>
    <h2 class="font-bold">{startDate} - {startTime} > {endDate} - {endTime}</h2>
    <p>{description}</p>
</div>
