import { sqlDateToJsDate } from '$lib/date-helpers.js';


function generateCalendarData(currentDate) {
    // Empty existing data
    let calendarData = [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    let firstDayIndex = new Date(`${year}-${month}-01`).getDay();

    // Adjustment for French notation (Monday=1, Sunday=7)
    if (firstDayIndex === 0) {
        firstDayIndex = 7;
    }

    const daysInCurrentMonth = new Date(year, month, 0).getDate();
    const daysInPreviousMonth = new Date(year, month - 1, 0).getDate();

    // Generate calendar days
    for (let day = 1; day <= 35; day++) {
        let dayNumber, dayMonth, dayYear, selected = false;

        // Days of previous month
        if (day < firstDayIndex) {
            dayNumber = daysInPreviousMonth - firstDayIndex + 1 + day;
            dayMonth = month - 1;
            dayYear = year;

            if (dayMonth === 0) {
                dayMonth = 12;
                dayYear -= 1;
            }
            // Days of the following month
        } else if (day >= firstDayIndex + daysInCurrentMonth) {
            dayNumber = day - (firstDayIndex + daysInCurrentMonth) + 1;
            dayMonth = month + 1;
            dayYear = year;

            if (dayMonth === 13) {
                dayMonth = 1;
                dayYear += 1;
            }

            // Days of the current month
        } else {
            dayNumber = day - firstDayIndex + 1;
            dayMonth = month;
            dayYear = year;
        }

        // Add the day's information to the calendar data
        calendarData.push({
            day: dayNumber,
            month: dayMonth,
            year: dayYear,
            selected: false,
            events: []
        });
    }

    return calendarData;
}

async function recoverCalendarEvents(monthData) {

    const currentUserId = localStorage.getItem("id");

    try {
        const response = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId }),
        });

        if (!response.ok)  throw new Error('Failed to fetch events');

        // Get data in json format
        const {eventsData} = await response.json();

        // Check if month day contain events
        for (let md = 0; md < 35; md++) {
            const monthDate = new Date(
                monthData[md].year,
                monthData[md].month - 1,
                monthData[md].day
            );

            for (let event in eventsData) {
                // Get event date and format day
                let [year, month, day] = sqlDateToJsDate(eventsData[event].date_debut);
                const eventStartDate = new Date(year, month - 1, day);

                [year, month, day] = sqlDateToJsDate(eventsData[event].date_fin);
                const eventEndDate = new Date(year, month - 1, day);

                const dateOptions = {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'}

                // console.log(monthDate);
                // console.log(eventStartDate)
                // console.log(eventEndDate)

                if (monthDate >= eventStartDate && monthDate <= eventEndDate) {
                    // Add event to monthData
                    monthData[md].events.push({
                        title: eventsData[event].titre,
                        startDate: eventStartDate.toLocaleDateString("en-US", dateOptions),
                        endDate: eventEndDate.toLocaleDateString("en-US", dateOptions),
                        startTime: eventsData[event].heure_debut,
                        endTime: eventsData[event].heure_fin,
                        description: eventsData[event].description,
                    })
                }
            }
        }
        return monthData;
    }
    catch (error) {
        console.log('Error recovering events:', error);
        throw error;
    }
}

async function containsEvents(monthData, day) {
    console.log(monthData[day]);
    console.log( "DAY : ", day)
}

export {generateCalendarData, recoverCalendarEvents, containsEvents};
