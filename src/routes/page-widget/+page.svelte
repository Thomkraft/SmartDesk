<script>
    import { dndzone } from "svelte-dnd-action";
    import ContextMenu from "./ContextMenu.svelte";
    import WidgetTemplate from "$lib/Note.svelte";
    import { onMount } from "svelte";
    import { getWidgetsByUserId, insertWidget, updateWidget, deleteWidget } from '$lib/widgetService';

    const FIXED_USER_ID = 15;
    let showPopup = false;
    let widgets = [];
    let contextMenuVisible = false;
    let contextMenuPosition = { x: 0, y: 0 };
    let selectedWidgetId = null;
    let isEditing = false;
    let widgetToEdit = null;
    const flipDurationMs = 300;

    onMount(async () => {
        const userWidgets = await getWidgetsByUserId(FIXED_USER_ID);
        widgets = userWidgets.map(w => ({
            id: w.id_widget,
            type: w.type,
            template: w.contenu,
            position: w.position
        }));
    });

    async function addWidget(type) {
        const newWidget = { 
            type, 
            template: "", 
            position: widgets.length,
            id_utilisateur: FIXED_USER_ID 
        };
        
        const widgetId = await insertWidget(newWidget);
        newWidget.id = widgetId;
        widgets = [...widgets, newWidget];
        showPopup = false;
    }

    async function handleDndEvent(e) {
        const { items: newWidgets, info } = e.detail;
        
        // Only update positions when drag is actually finished
        if (info.trigger === "finalize") {
            // Update local state first for smooth UI
            widgets = newWidgets;

            try {
                // Prepare minimal payload for position updates
                const updates = newWidgets.map((widget, index) => 
                    updateWidget({
                        id: widget.id,
                        position: index,
                        id_utilisateur: FIXED_USER_ID
                    })
                );

                await Promise.all(updates);
            } catch (error) {
                console.error('Failed to update widget positions:', error);
                // Optionally revert to previous state if needed
            }
        } else {
            // Just update UI for "consider" events
            widgets = newWidgets;
        }
    }

    function showContextMenu({ widgetId, event }) {
        selectedWidgetId = widgetId;
        contextMenuPosition = { x: event.clientX, y: event.clientY };
        contextMenuVisible = true;
    }

    function hideContextMenu() {
        contextMenuVisible = false;
    }

    async function editWidget(id, newContent) {
        const widget = widgets.find(w => w.id === id);
        if (widget) {
            widget.template = newContent;
            await updateWidget(widget);
            widgets = [...widgets];
        }
        isEditing = false;
        widgetToEdit = null;
        hideContextMenu();
    }

    async function handleDelete(id) {
        await deleteWidget(id);
        widgets = widgets.filter(widget => widget.id !== id);
        hideContextMenu();
    }

    function startEditing(id) {
        widgetToEdit = widgets.find(widget => widget.id === id);
        isEditing = true;
        hideContextMenu();
    }

    function handleCancel() {
        isEditing = false;
        widgetToEdit = null;
    }
</script>

<div class="container mx-auto p-4" on:click={hideContextMenu} role="presentation">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold">Widget list</h1>
        <button on:click={() => showPopup = true} 
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
            Add Widget
        </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
         use:dndzone={{ items: widgets, flipDurationMs, dragDisabled: isEditing }} 
         on:consider={handleDndEvent} 
         on:finalize={handleDndEvent}>
        {#each widgets as widget (widget.id)}
            <div class="w-full bg-white rounded-lg shadow-md">
                <WidgetTemplate
                    {widget}
                    onEdit={editWidget}
                    onDelete={handleDelete}
                    onContextMenu={showContextMenu}
                    isEditing={isEditing && widgetToEdit?.id === widget.id}
                    bind:widgetToEdit
                    onSave={editWidget}
                    onCancel={handleCancel}
                />
            </div>
        {/each}
    </div>

    {#if widgets.length === 0}
        <div class="w-full text-center text-gray-500 mt-8">
            No widgets created yet. Click "Add Widget" to get started.
        </div>
    {/if}

    {#if showPopup}
        <div class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h2 class="text-2xl font-semibold mb-6">Select a widget template</h2>
                <button on:click={() => addWidget("note")} 
                        class="w-full mb-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                    Note
                </button>
                <button on:click={() => showPopup = false} 
                        class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors">
                    Close
                </button>
            </div>
        </div>
    {/if}

    {#if contextMenuVisible}
        <ContextMenu 
            position={contextMenuPosition} 
            onEdit={startEditing}
            onDelete={handleDelete} 
            widgetId={selectedWidgetId} 
        />
    {/if}
</div>
