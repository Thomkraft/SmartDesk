<script>
    export let content = "";
    export let onSave;
    export let onCancel;
    let newContent = content;

    function applyStyle(style, value) {
        document.execCommand(style, false, value);
    }

    function handleSave() {
        onSave(newContent);
    }

    function handleCancel() {
        newContent = content;
        onCancel();
    }
</script>

<div class="flex flex-col h-full">
    <div contenteditable="true" bind:innerHTML={newContent} class="flex-grow w-full text-white" on:input={(e) => newContent = e.target.innerHTML}></div>
    <div class="flex justify-end items-center mt-2">
        <div class="toolbar flex space-x-2">
            <button class="bg-gray-200 p-2 rounded" title="Bold" on:click={() => applyStyle('bold')}>Bold</button>
            <button class="bg-gray-200 p-2 rounded" title="Italic" on:click={() => applyStyle('italic')}>Italic</button>
            <button class="bg-gray-200 p-2 rounded" title="Font Color" on:click={() => applyStyle('foreColor', 'red')}>Color</button>
        </div>
        <div class="flex space-x-2 ml-4">
            <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={handleSave}>Save</button>
            <button class="bg-red-500 text-white px-4 py-2 rounded" on:click={handleCancel}>Cancel</button>
        </div>
    </div>
</div>