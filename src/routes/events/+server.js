import mysql from 'mysql2/promise';


export async function POST({ request }) {
    try {
        // Get data
        const event = await request.json();

        if (!event.userId) {
            return new Response(
                JSON.stringify({ message: 'User ID is missing.' }),
                { status: 400 }
            );
        }

        // Create connection to database
        const con = await mysql.createConnection({
            host: '85.215.130.37',
            user: 'SAE2',
            password: 'Zao@67.pomme',
            database: 'smartdesk',
            connectTimeout: 5000
        });

        if (event.action === "createEvent") {

            const [result] = await con.query(
                'INSERT INTO evenement (titre, description, date_debut, date_fin, heure_debut, heure_fin, id_utilisateur) VALUES (?,?,?,?,?,?,?)',
                [event.title, event.description, event.startDate, event.endDate, event.startTime, event.endTime, event.userId]
            );

            await con.end();

            return new Response(
                JSON.stringify({
                    message: 'Update informations success.',
                }),
                { status: 200 }
            );
        }

        if (event.action === "deleteEvent") {

            const [result] = await con.query(
                'DELETE FROM evenement WHERE id_evenement = ?',
                [event.eventId]
            );

            await con.end();

            return new Response(
                JSON.stringify({
                    message: 'Update informations success.',
                }),
                { status: 200 }
            );
        }
    }
    catch (e) {
        console.error("Error fetching events : " + e);
        await con.end();
    }
}