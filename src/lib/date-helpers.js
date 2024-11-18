// Get all weekends, 6 when it's saturday, 7 when it's sunday
const isWeekend = day => {
    return day % 7 === 0 || day % 7 === 6;
}

const getDayName = day => {
    const date = new Date(Date.UTC(2024, 0, day));
    const options = {weekday: "short"};
    return new Intl.DateTimeFormat("en-US", options).format(date);
}

// Export all functions
export {isWeekend, getDayName};