function toggleEventMenu() {
    document.getElementById("event-menu").classList.toggle("hidden");
    //document.getElementById("event-menu").classList.toggle("-translate-x-full");

    // Toggle border right header
    document.getElementById("calendar-header").classList.toggle("border-r-2");
    document.getElementById("calendar-header").classList.toggle("border-gray-300");
}

export {toggleEventMenu};