import mysql from 'mysql2/promise';


export async function POST({ request }) {
    try {
        // Get data
        const { userId, title, startDate, endDate, startTime, endTime, description } = await request.json();

        if (!userId) {
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

        const [rows] = await con.query(
            'INSERT INTO evenement (titre, description, date_debut, date_fin, heure_debut, heure_fin, id_utilisateur) VALUES (?,?,?,?,?,?,?)',
            [title], [description], [startDate], [endDate], [startTime], [endTime], [userId]
        );

        await con.end();

        return new Response(
            JSON.stringify({
                message: 'Update informations success.',
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