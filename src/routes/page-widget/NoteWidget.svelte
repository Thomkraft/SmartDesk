<script>
    export let widget;
    export let onEdit;
    export let onDelete;

    let isEditing = false;
    let editedContent = widget.template;

    function startEditing() {
        isEditing = true;
    }

    function saveEdit() {
        onEdit(widget.id, editedContent);
        isEditing = false;
    }

    function cancelEdit() {
        isEditing = false;
    }

    function deleteWidget() {
        onDelete(widget.id);
    }

    function showContextMenu(event, widgetId) {
        event.preventDefault();
        const customEvent = new CustomEvent('contextmenu', {
            detail: { widgetId, event },
            bubbles: true,
        });
        dispatchEvent(customEvent);
    }
</script>

<style>
    .widget {
        border: 1px solid #ccc;
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #f9f9f9;
        width: 200px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
</style>

<div class="widget" on:contextmenu={(event) => showContextMenu(event, widget.id)}>
    {#if isEditing}
        <textarea bind:value={editedContent}></textarea>
        <button on:click={saveEdit}>Save</button>
        <button on:click={cancelEdit}>Cancel</button>
    {:else}
        <div role="note">
            {widget.template}
        </div>
    {/if}
</div>