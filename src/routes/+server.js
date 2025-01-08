import mysql from 'mysql2/promise';

export async function POST() {
    try {
        // Create connection to database
        const con = await mysql.createConnection({
            host: '85.215.130.37',
            user: 'SAE2',
            password: 'Zao@67.pomme',
            database: 'smartdesk',
            connectTimeout: 5000
        });

        console.log("Database connected");

        // const [rows] = await con.query(
        //     `SELECT titre, description, date_debut, date_fin, heure_debut, heure_fin
        //      FROM events`
        //     //  WHERE event_date BETWEEN ? AND ?
        //     //  ORDER BY event_date ASC`,
        //     // [startDate, endDate]
        // );

        const [rows] = await con.query(
            'SELECT titre, description, date_debut, date_fin, heure_debut, heure_fin FROM evenement');

        await con.end();

        return new Response(
            JSON.stringify({
                message: 'Informations mises à jour avec succès.',
                eventsData: rows
            }),
            { status: 200 }
        );
    }
    catch (e) {
        console.error("Error fetching events : " + e);
        await con.end();
    }
}