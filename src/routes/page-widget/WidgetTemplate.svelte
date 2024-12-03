<script>
    import NoteWidget from '$lib/NoteWidget.svelte';

    export let widget;
    export let isEditing;
    export let widgetToEdit;
    export let onEdit;
    export let onDelete;
    export let onContextMenu;
    export let onSave;
    export let onCancel;

    let newContent = widget.template;
    let originalContent = widget.template;

    $: if (isEditing && widgetToEdit && widgetToEdit.id === widget.id) {
        newContent = widgetToEdit.template;
        originalContent = widgetToEdit.template;
    }

    function handleSave(content) {
        onSave(widgetToEdit.id, content);
    }
</script>

<div
    class="widget-container border border-gray-300 p-4 bg-gray-800 shadow-[0_-1px_1px_0_rgba(0,255,255,1),1px_0_1px_0_rgba(0,255,255,1)] flex flex-col justify-between w-96 h-128"
    role="region"
    on:contextmenu={(event) => {
        event.preventDefault();
        onContextMenu({ widgetId: widget.id, event });
    }}
>
    {#if isEditing}
        {#if widget.type === 'note'}
            <NoteWidget {newContent} onSave={handleSave} onCancel={onCancel} />
        {/if}
    {:else}
        <div class="widget-content flex-grow overflow-y-auto text-white">
            {@html widget.template}
        </div>
    {/if}
</div>
<style>
    .widget-container {
        width: 400px;
        height: 600px;
    }
</style>