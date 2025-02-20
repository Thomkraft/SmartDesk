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
    class="h-[500px] w-[400px] bg-gray-800  flex flex-col"
    on:contextmenu|preventDefault={(event) => onContextMenu(event)}
    role="region"
>

    {#if isEditing}
        <div class="flex flex-col h-full">
            <div 
                contenteditable="true" 
                bind:innerHTML={newContent} 
                class="flex-grow w-full text-white bg-transparent p-4"
                style="white-space: pre-wrap; word-wrap: break-word;"
                on:input={(e) => newContent = e.target.innerHTML}
            ></div>
            <div class="p-4 bg-gray-800">
                <div class="flex items-center justify-between space-x-4 w-full">
                <div class="toolbar flex flex-nowrap space-x-2">
                    <button class="bg-gray-200 p-2 rounded whitespace-nowrap" title="Bold" on:click={() => applyStyle('bold')}>Bold</button>
                    <button class="bg-gray-200 p-2 rounded whitespace-nowrap" title="Italic" on:click={() => applyStyle('italic')}>Italic</button>
                    <button class="bg-gray-200 p-2 rounded whitespace-nowrap" title="Font Color" on:click={() => applyStyle('foreColor', 'red')}>Color</button>
                </div>
                <div class="flex space-x-2">
                    <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={() => onSave(widgetToEdit.id, newContent)}>Save</button>
                    <button class="bg-red-500 text-white px-4 py-2 rounded" on:click={handleCancel}>Cancel</button>
                </div>
            </div>
        </div>
    </div>
    {:else}
        <div class="h-full w-full text-white p-4 break-words" 
             style="white-space: pre-wrap; word-wrap: break-word;">
            {@html widget.template}
        </div>
    {/if}
</div>

<style>
    .line-clamp-15 {
        display: -webkit-box;
        -webkit-line-clamp: 15;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .line-clamp-18 {
        display: -webkit-box;
        -webkit-line-clamp: 18;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>

