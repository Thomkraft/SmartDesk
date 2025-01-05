<script>
    export let position;
    export let onEdit;
    export let onDelete;
    export let widgetId;
    export let type;

    function handleEdit() {
        onEdit(widgetId);
        hideContextMenu(); 
    }

    function handleDelete() {
        onDelete(widgetId);
        hideContextMenu();
    }

    function hideContextMenu() {
        const event = new CustomEvent('hideContextMenu');
        window.dispatchEvent(event);
    }
</script>

<div class="fixed bg-white shadow-lg rounded p-2 z-50" style="top: {position.y}px; left: {position.x}px;" role="menu">
    {#if type === 'note'}
        <button class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" on:click={handleEdit}>
            Edit
        </button>
    {/if}
    <button class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" on:click={handleDelete}>
        Delete
    </button>
</div>