import mysql from 'mysql2/promise';


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
        });
    }

    return calendarData;
}

async function recoverCalendarEvents() {
    const mysql = require('mysql2');

    console.log(mysql)

    // Create connection to database
    const con = await mysql.createConnection({
        host: '85.215.130.37',
        user: 'SAE2',
        password: 'Zao@67.pomme',
        database: 'smartdesk',
        connectTimeout: 5000
    });

    console.log(con);

    try {
        const [rows] = await con.query(
            `SELECT id, title, description, event_date 
             FROM events 
             WHERE event_date BETWEEN ? AND ?
             ORDER BY event_date ASC`,
            [startDate, endDate]
        );

        console.log(rows);
    }
    catch (e) {
        console.error("Error fetching events : " + e);
        await con.end();
    }
}

export {generateCalendarData, recoverCalendarEvents};