export async function getFavorites(userId) {
    try {
        const response = await fetch(`/favorites?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch favorites');
        return await response.json();
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
}

export async function addFavorite(userId, label, lien) {
    try {
        const response = await fetch('/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, label, lien })
        });
        if (!response.ok) throw new Error('Failed to add favorite');
        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
}

export async function updateFavorite(id, label, lien, userId) {
    try {
        const response = await fetch('/favorites', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, label, lien, userId })
        });
        if (!response.ok) throw new Error('Failed to update favorite');
        return await response.json();
    } catch (error) {
        console.error('Error updating favorite:', error);
        throw error;
    }
}

export async function deleteFavorite(id, userId) {
    try {
        const response = await fetch(`/favorites?id=${id}&userId=${userId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete favorite');
        return await response.json();
    } catch (error) {
        console.error('Error deleting favorite:', error);
        throw error;
    }
}