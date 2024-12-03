// src/lib/widgetService.js
import mysql from 'mysql2/promise';

export async function insertWidget(widget) {
    const db = await mysql.createConnection({
        host: '85.215.130.37',
        user: 'SAE2',
        password: 'Zao@67.pomme',
        database: 'smartdesk',
        connectTimeout: 5000
    });

    const [result] = await db.query(
        'INSERT INTO widget (type, contenu, position, id_utilisateur) VALUES (?, ?, ?, ?)',
        [widget.type, widget.template, widget.position, widget.id_utilisateur]
    );

    await db.end();
    return result.insertId;
}

export async function updateWidget(widget) {
    const db = await mysql.createConnection({
        host: '85.215.130.37',
        user: 'SAE2',
        password: 'Zao@67.pomme',
        database: 'smartdesk',
        connectTimeout: 5000
    });

    await db.query(
        'UPDATE widget SET contenu = ?, position = ? WHERE id_widget = ?',
        [widget.template, widget.position, widget.id]
    );

    await db.end();
}