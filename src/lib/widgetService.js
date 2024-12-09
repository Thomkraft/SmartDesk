export async function getWidgetsByUserId(userId) {
    try {
        const response = await fetch(`/page-widget?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch widgets');
        return await response.json();
    } catch (error) {
        console.error('Error fetching widgets:', error);
        return [];
    }
}

export async function insertWidget(widget) {
    try {
        const response = await fetch('/page-widget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(widget)
        });
        if (!response.ok) throw new Error('Failed to insert widget');
        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Error inserting widget:', error);
        throw error;
    }
}

export async function updateWidget(widget) {
    try {
        console.log('Updating widget:', widget); // Debug log
        const response = await fetch('/page-widget', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_widget: widget.id_widget,
                position: widget.position,
                type: widget.type,
                contenu: widget.contenu || widget.template
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update widget: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating widget:', error);
        throw error;
    }
}

export async function deleteWidget(widgetId) {
    try {
        const response = await fetch(`/page-widget?id=${widgetId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete widget');
    } catch (error) {
        console.error('Error deleting widget:', error);
        throw error;
    }
}