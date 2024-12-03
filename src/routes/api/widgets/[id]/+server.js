// src/routes/api/widgets/[id]/+server.js
import { updateWidget } from '$lib/widgetService.js';

export async function PUT({ request, params }) {
    const widget = await request.json();
    widget.id = params.id;
    await updateWidget(widget);
    return new Response(null, { status: 204 });
}