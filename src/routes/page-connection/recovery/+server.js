import { createTransport } from 'nodemailer';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { onMount } from 'svelte';

export async function POST({ request }) {

    const { email, token, password } = await request.json();

    const db = await mysql.createConnection({
        host: '85.215.130.37',
        user: 'SAE2',
        password: 'Zao@67.pomme',
        database: 'smartdesk',
        connectTimeout: 5000
    });

    //mettre la bonne url
    let url = 'http://localhost:5173/page-connection/recovery';

    if (token && password) {


        // partie NewPassword


        const [rows] = await db.query('SELECT * FROM changement_mdp WHERE token = ?', [token]);
        if (rows.length == 0) {
            await db.end();
            return new Response(JSON.stringify({ message: 'Token invalide' }), { status: 400 });
        }
        if (rows[0].date_expiration < new Date()) {
            await db.end();
            return new Response(JSON.stringify({ message: 'Token expiré' }), { status: 400 });
        }
        if (rows[0].utilise) {
            await db.end();
            return new Response(JSON.stringify({ message: 'Token déjà utilisé' }), { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query('UPDATE utilisateur SET mdp_utilisateur = ? WHERE email_utilisateur = ?', [hashedPassword, rows[0].email_utilisateur]);
        await db.query('UPDATE changement_mdp SET utilise = ? WHERE token = ?', [true, token]);
        await db.end();
        return new Response(JSON.stringify({ message: "Mot de passe mis à jour avec succès" }), { status: 201 });

    } else if (email) {


        // partie SendMail


        const [rows] = await db.query('SELECT * FROM utilisateur WHERE email_utilisateur = ?', [email]);
        if (rows.length == 0) {
            await db.end();
            return new Response(JSON.stringify({ message: 'L\'adresse mail n\'existe pas dans la base' }), { status: 404 });
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + 3600000);

        await db.query('INSERT INTO changement_mdp (email_utilisateur, token, date_creation, date_expiration, utilise) VALUES (?, ?, ?, ?, ?)', 
            [email, token, now, expirationDate, false]);
        
        await db.end();
        try {
            let transporter = createTransport({
                service: 'gmail',
                auth: {
                    user: 'tiakin69@gmail.com',
                    pass: 'gtww iwxp sedl fkuj'
                }
            });


            let mailOptions = {
                from: '"SmartDesk" <tiakin69@gmail.com>',
                to: email,
                subject: 'Changement de mot de passe',
                text: 'Cliquez ici pour changer de mot de passe : '+ {url} +'?token=' + token,
            };
            
            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    return new Response(JSON.stringify({ message: "Une erreur est survenue" }), { status: 500 });
                }
            });

            return new Response(JSON.stringify({ message: "Un mail de récupération vous a été envoyé" }), { status: 201 });

        } catch (error) {
            return new Response(JSON.stringify({ message: "Une erreur est survenue" }), { status: 500 });
        }
    }
}