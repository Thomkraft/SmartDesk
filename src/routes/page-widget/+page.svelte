<script>
    import { dndzone } from "svelte-dnd-action";
    import ContextMenu from "./ContextMenu.svelte";
    import WidgetTemplate from "./WidgetTemplate.svelte";
    import { onMount } from "svelte";
    import { isConnected } from "$lib/store.js";

    let showPopup = false;
    let widgets = [];
    let contextMenuVisible = false;
    let contextMenuPosition = { x: 0, y: 0 };
    let selectedWidgetId = null;
    let isEditing = false;
    let widgetToEdit = null;

    // Use the $ prefix only in reactive statements
    $: isConnectedValue = $isConnected;

    async function togglePopup() {
        showPopup = !showPopup;
    }

    async function addWidget(type) {
        if (!isConnectedValue) {
            alert("You must be connected to add a widget.");
            return;
        }
        const newWidget = { type, template: "", position: widgets.length, id_utilisateur: 1 };
        const response = await fetch('/api/widgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newWidget)
        });
        const result = await response.json();
        newWidget.id = result.id;
        widgets = [...widgets, newWidget];
        togglePopup();
    }

    async function handleDndEvent({ detail }) {
        widgets = detail.items;
        for (const widget of widgets) {
            if (widget.id.startsWith('id:dnd-shadow-placeholder')) {
                continue; // Skip placeholder items
            }
            await fetch(`/api/widgets/${widget.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(widget)
            });
        }
    }

    function showContextMenu({ widgetId, event }) {
        selectedWidgetId = widgetId;
        contextMenuPosition = {
            x: event.clientX,
            y: event.clientY,
        };
        contextMenuVisible = true;
    }

    function hideContextMenu() {
        contextMenuVisible = false;
    }

    async function editWidget(id, newContent) {
        widgets = widgets.map((widget) =>
            widget.id === id ? { ...widget, template: newContent } : widget,
        );
        const widget = widgets.find(widget => widget.id === id);
        await fetch(`/api/widgets/${widget.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(widget)
        });
        isEditing = false;
        widgetToEdit = null;
        hideContextMenu();
    }

    function deleteWidget(id) {
        widgets = widgets.filter((widget) => widget.id !== id);
        hideContextMenu();
    }

    function startEditing(id) {
        widgetToEdit = widgets.find((widget) => widget.id === id);
        isEditing = true;
        hideContextMenu();
    }

    function handleSave(id, newContent) {
        editWidget(id, newContent);
    }

    function handleCancel() {
        isEditing = false;
        widgetToEdit = null;
    }

    function handleClickOutside(event) {
        if (isEditing && !event.target.closest('.widget-container')) {
            handleCancel();
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
    });
    $: {
        if (!isEditing) {
            onMount(() => {
                document.removeEventListener('click', handleClickOutside);
            });
        }
    }
</script>

<div class="container mx-auto p-4" on:click={hideContextMenu} role="presentation">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold">Widget list</h1>
        {#if isConnectedValue}
            <button on:click={togglePopup} class="bg-blue-500 text-white px-4 py-2 rounded">Add Widget</button>
        {/if}
    </div>
    <div class="flex flex-wrap gap-4" use:dndzone={{ items: widgets, flipDurationMs: 150 }} on:consider={handleDndEvent} on:finalize={handleDndEvent}>
        {#each widgets as widget (widget.id)}
            <div class="widget-container">
                <WidgetTemplate
                    {widget}
                    onEdit={editWidget}
                    onDelete={deleteWidget}
                    onContextMenu={showContextMenu}
                    isEditing={isEditing && widgetToEdit && widgetToEdit.id === widget.id}
                    bind:widgetToEdit={widgetToEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        {/each}
    </div>

    {#if widgets.length === 0}
        {#if isConnectedValue}
            <div class="w-full text-center text-gray-500 mt-8">
                No widgets created yet. Click "Add Widget" to get started.
            </div>
        {:else}
            <div class="w-full text-center text-gray-500 mt-8">
                Please connect to create widgets.
            </div>
        {/if}
    {/if}

    {#if showPopup}
        <div class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded shadow-lg flex flex-col items-center justify-center w-full max-w-md">
                <h2 class="text-2xl mb-4">Select a widget template</h2>
                <button on:click={() => addWidget("note")} class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Note</button>
                <button on:click={togglePopup} class="mt-4 bg-red-500 text-white px-4 py-2 rounded">Close</button>
            </div>
        </div>
    {/if}

    {#if contextMenuVisible}
        <ContextMenu position={contextMenuPosition} onEdit={startEditing} onDelete={deleteWidget} widgetId={selectedWidgetId} />
    {/if}
</div>