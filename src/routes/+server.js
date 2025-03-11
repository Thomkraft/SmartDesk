import mysql from 'mysql2/promise';


export async function POST({ request }) {
    try {
        // Get user ID
        const { userId } = await request.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ message: 'User ID is missing.' }),
                { status: 400 }
            );
        }

        // Create connection to database
        const con = await mysql.createConnection({
            host: 'localhost',
            user: 'SAE2',
            password: 'Zao@67.pomme',
            database: 'smartdesk',
            connectTimeout: 5000
        });

        const [rows] = await con.query(
            'SELECT * FROM evenement WHERE id_utilisateur = ?', [userId]
        );

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