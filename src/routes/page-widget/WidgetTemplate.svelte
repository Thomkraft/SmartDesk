<script>
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

    function applyStyle(style, value) {
        document.execCommand(style, false, value);
    }

    function handleCancel() {
        newContent = originalContent;
        onCancel();
    }
</script>

<div
    class="widget-container border border-gray-300 p-4 shadow-md bg-white flex flex-col justify-between w-96 h-128"
    role="region"
    on:contextmenu={(event) => {
        event.preventDefault();
        onContextMenu({ widgetId: widget.id, event });
    }}
>
    {#if isEditing}
        <div class="flex flex-col h-full">
            <div contenteditable="true" bind:innerHTML={newContent} class="flex-grow w-full" on:input={(e) => newContent = e.target.innerHTML}></div>
            <div class="flex justify-end items-center mt-2">
                <div class="toolbar flex space-x-2">
                    <button class="bg-gray-200 p-2 rounded" title="Bold" on:click={() => applyStyle('bold')}>Bold</button>
                    <button class="bg-gray-200 p-2 rounded" title="Italic" on:click={() => applyStyle('italic')}>Italic</button>
                    <button class="bg-gray-200 p-2 rounded" title="Font Color" on:click={() => applyStyle('foreColor', 'red')}>Color</button>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={() => onSave(widgetToEdit.id, newContent)}>Save</button>
                    <button class="bg-red-500 text-white px-4 py-2 rounded" on:click={handleCancel}>Cancel</button>
                </div>
            </div>
        </div>
    {:else}
        <div class="widget-content flex-grow overflow-y-auto">
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
