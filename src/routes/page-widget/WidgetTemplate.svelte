<script>
    export let widget;
    export let isEditing = false;
    export let onEdit;
    export let onContextMenu;
    export let closeEditModal;
    let newContent = widget.template;

    function handleSave() {
        onEdit(widget.id, newContent);
        closeEditModal();
    }

    function applyStyle(command, value = null) {
        document.execCommand(command, false, value);
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
                    <button class="bg-gray-200 p-2 rounded" title="Bold" on:click={() => applyStyle('bold')}>B</button>
                    <button class="bg-gray-200 p-2 rounded" title="Italic" on:click={() => applyStyle('italic')}>I</button>
                    <button class="bg-gray-200 p-2 rounded" title="Underline" on:click={() => applyStyle('underline')}>U</button>
                    <button class="bg-gray-200 p-2 rounded" title="Font Size" on:click={() => applyStyle('fontSize', '4')}>A+</button>
                    <button class="bg-gray-200 p-2 rounded" title="Font Color" on:click={() => applyStyle('foreColor', 'red')}>Color</button>
                    <button class="bg-gray-200 p-2 rounded" title="Bullet List" on:click={() => applyStyle('insertUnorderedList')}>• List</button>
                    <button class="bg-gray-200 p-2 rounded" title="Numbered List" on:click={() => applyStyle('insertOrderedList')}>1. List</button>
                    <button class="bg-gray-200 p-2 rounded" title="Checklist" on:click={() => applyStyle('insertCheckbox')}>☑ Checklist</button>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button on:click={handleSave} class="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                    <button on:click={closeEditModal} class="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
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
        width: 400px; /* Fixed width */
        height: 600px; /* Fixed height */
    }
    .toolbar button {
        min-width: 32px;
        min-height: 32px;
    }
</style>