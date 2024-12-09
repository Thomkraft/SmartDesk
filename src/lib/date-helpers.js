// Get all weekends, 6 when it's saturday, 7 when it's sunday
const isWeekend = day => {
    return day % 7 === 0 || day % 7 === 6;
}

const isCurrentDay = (day) => {
    const todayDate = new Date(Date.now());

    //console.log(
        //'today\n' +
        //todayDate.getDate() + todayDate.getMonth() + todayDate.getFullYear() +
        //'\nday\n' +
      //  day.getDate() + day.getMonth() + day.getFullYear()
    //);

    return todayDate.getDate() === day.getDate() &&
        todayDate.getMonth() === day.getMonth() &&
        todayDate.getFullYear() === day.getFullYear();

}

const getMonthName = (date) => {
    const options = {month: "long"};
    return new Intl.DateTimeFormat("en-US", options).format(date);
}

const getDayName = day => {
    const date = new Date(Date.UTC(2024, 0, day));
    const options = {weekday: "short"};
    return new Intl.DateTimeFormat("en-US", options).format(date);
}

// Export all functions
export { isCurrentDay, isWeekend, getDayName, getMonthName };