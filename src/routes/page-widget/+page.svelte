<script>
    import { dndzone } from 'svelte-dnd-action';
    import NoteWidget from './NoteWidget.svelte';

    let showPopup = false;
    let widgets = [];
    let contextMenuVisible = false;
    let contextMenuPosition = { x: 0, y: 0 };
    let selectedWidgetId = null;
    let showNoteOptions = false;
    let isEditing = false;
    let widgetToEdit = null;

    function togglePopup() {
        showPopup = !showPopup;
    }

    function addWidget(template) {
        widgets = [...widgets, { id: widgets.length, template }];
        togglePopup();
    }

    function handleDndEvent({ detail }) {
        widgets = detail.items;
    }

    function showContextMenu(event) {
        event.preventDefault();
        const { widgetId, event: originalEvent } = event.detail;
        selectedWidgetId = widgetId;
        contextMenuPosition = { x: originalEvent.clientX, y: originalEvent.clientY };
        contextMenuVisible = true;
    }

    function hideContextMenu() {
        contextMenuVisible = false;
    }

    function editWidget(id, newContent) {
        widgets = widgets.map(widget => widget.id === id ? { ...widget, template: newContent } : widget);
        hideContextMenu();
    }

    function deleteWidget(id) {
        widgets = widgets.filter(widget => widget.id !== id);
        hideContextMenu();
    }

    function startEditing(id) {
        widgetToEdit = widgets.find(widget => widget.id === id);
        isEditing = true;
        hideContextMenu();
    }

    function closeEditModal() {
        isEditing = false;
        widgetToEdit = null;
    }
</script>

<div class="container mx-auto p-4" on:click={hideContextMenu} role="presentation">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold">Widget list</h1>
        <button on:click={togglePopup} class="bg-blue-500 text-white px-4 py-2 rounded">Add Widget</button>
    </div>
    <div class="flex flex-wrap gap-4" use:dndzone={{ items: widgets, flipDurationMs: 0 }} on:consider={handleDndEvent} on:finalize={handleDndEvent}>
        {#each widgets as widget (widget.id)}
            <NoteWidget {widget} onEdit={editWidget} onDelete={deleteWidget} on:contextmenu={showContextMenu} />
        {/each}
    </div>

    {#if contextMenuVisible}
        <div class="fixed bg-white shadow-lg rounded p-2 z-50" style="top: {contextMenuPosition.y}px; left: {contextMenuPosition.x}px;" role="menu">
            <button class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" on:click={() => startEditing(selectedWidgetId)}>Edit</button>
            <button class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" on:click={() => deleteWidget(selectedWidgetId)}>Delete</button>
        </div>
    {/if}

    {#if showPopup}
        <div class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded shadow-lg flex flex-col items-center justify-center w-72 h-72">
                <h2 class="text-2xl mb-4">Sélectionnez un template de widget</h2>
                <button on:click={() => addWidget('note')} class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Bloc Notes</button>
                <button on:click={() => addWidget('timer')} class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Timer</button>
                <button on:click={() => addWidget('spotify')} class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Lecteur Spotify</button>
                <button on:click={togglePopup} class="mt-4 bg-red-500 text-white px-4 py-2 rounded">Fermer</button>
            </div>
        </div>
    {/if}

    {#if isEditing}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div class="bg-white p-8 rounded shadow-lg w-96" on:click|stopPropagation>
                <h2 class="text-2xl mb-4">Edit Widget</h2>
                {#if widgetToEdit.template === 'note'}
                    <textarea bind:value={widgetToEdit.template} class="w-full h-32 p-2 border rounded"></textarea>
                {/if}
                <!-- Add more conditions for other widget types if needed -->
                <button on:click={() => editWidget(widgetToEdit.id, widgetToEdit.template)} class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                <button on:click={closeEditModal} class="mt-4 bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
        </div>
        
        <script>
            function handleKeydown(event) {
                if (event.key === 'Escape') {
                    closeEditModal();
                }
            }
        </script>
    {/if}

    {#if showNoteOptions}
        <div class="fixed bottom-5 right-5 bg-white shadow-lg rounded p-4 z-50">
            <h3 class="text-lg font-bold mb-2">Options de Note</h3>
            <div class="flex flex-col space-y-2">
                <button on:click={() => setFontSize('text-sm')} class="bg-gray-200 px-4 py-2 rounded">Petite Police</button>
                <button on:click={() => setFontSize('text-base')} class="bg-gray-200 px-4 py-2 rounded">Police Moyenne</button>
                <button on:click={() => setFontSize('text-lg')} class="bg-gray-200 px-4 py-2 rounded">Grande Police</button>
                <button on:click={toggleUnderline} class="bg-gray-200 px-4 py-2 rounded">Souligner</button>
                <button on:click={() => setTextColor('text-red-500')} class="bg-red-500 text-white px-4 py-2 rounded">Rouge</button>
                <button on:click={() => setTextColor('text-blue-500')} class="bg-blue-500 text-white px-4 py-2 rounded">Bleu</button>
                <button on:click={() => setTextColor('text-green-500')} class="bg-green-500 text-white px-4 py-2 rounded">Vert</button>
                <button on:click={() => setListType('bullet')} class="bg-gray-200 px-4 py-2 rounded">Liste à Puces</button>
                <button on:click={() => setListType('number')} class="bg-gray-200 px-4 py-2 rounded">Liste Numérotée</button>
                <button on:click={() => setListType('none')} class="bg-gray-200 px-4 py-2 rounded">Aucune Liste</button>
            </div>
        </div>
    {/if}
</div>