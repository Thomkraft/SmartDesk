// src/routes/api/widgets/+server.js
import { insertWidget, updateWidget } from '$lib/widgetService.js';

export async function POST({ request }) {
    const widget = await request.json();
    const id = await insertWidget(widget);
    return new Response(JSON.stringify({ id }), { status: 201 });
}

export async function PUT({ request, params }) {
    const widget = await request.json();
    widget.id = params.id;
    await updateWidget(widget);
    return new Response(null, { status: 204 });
}