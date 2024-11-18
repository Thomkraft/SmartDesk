<script>
    import {onMount} from "svelte";

    let calendar;

    onMount(() => {
        calendar = document.getElementById("calendar");

        for (let day = 1; day <= 31; day++) {
            console.log(day);
            calendar.insertAdjacentHTML("beforeend", `<div class="day">${day}</div>`);
        }
    });
</script>

<div id="calendar"></div>