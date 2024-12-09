<script>
    import { dndzone } from "svelte-dnd-action";
    import ContextMenu from "./ContextMenu.svelte";
    import WidgetTemplate from "$lib/Note.svelte";
    import { onMount } from "svelte";
    import { getWidgetsByUserId, insertWidget, updateWidget, deleteWidget } from '$lib/widgetService';
    import { getUserData } from '$lib/store.js';
    import { isConnected } from '$lib/store.js';

    // State variables
    const user = getUserData();
    const FIXED_USER_ID = user?.id;
    let isLoading = true;
    let error = null;
    let showPopup = false;
    let widgets = [];
    let contextMenuVisible = false;
    let contextMenuPosition = { x: 0, y: 0 };
    let selectedWidgetId = null;
    let isEditing = false;
    let widgetToEdit = null;
    let isDragEnabled = false;
    let hasUnsavedChanges = false;
    let pendingPositions = [];
    const flipDurationMs = 150;

    // Initialize data on mount
    onMount(async () => {
        if (!FIXED_USER_ID) {
            error = "User ID not found. Please log in again.";
            isLoading = false;
            return;
        }

        try {
            const userWidgets = await getWidgetsByUserId(FIXED_USER_ID);
            if (!userWidgets) {
                throw new Error('No widgets data received');
            }
            widgets = userWidgets
                .sort((a, b) => a.position - b.position)
                .map(w => ({
                    id: w.id_widget,
                    type: w.type,
                    template: w.contenu,
                    position: w.position
                }));
        } catch (err) {
            console.error('Failed to fetch widgets:', err);
            error = err.message || 'Failed to load widgets';
        } finally {
            isLoading = false;
        }
    });

    // Widget management functions
    async function addWidget(type) {
        try {
            const position = widgets.length;
            const newWidget = { 
                type, 
                template: "", 
                position,
                id_utilisateur: FIXED_USER_ID 
            };
            
            const widgetId = await insertWidget(newWidget);
            newWidget.id = widgetId;
            widgets = [...widgets, newWidget];
            showPopup = false;
        } catch (err) {
            console.error('Failed to add widget:', err);
            error = 'Failed to add new widget';
        }
    }

    async function editWidget(id, newContent) {
        try {
            const widget = widgets.find(w => w.id === id);
            if (!widget) throw new Error('Widget not found');

            const widgetData = {
                id_widget: id,
                position: widget.position,
                type: widget.type,
                contenu: newContent,
                id_utilisateur: FIXED_USER_ID
            };
            
            await updateWidget(widgetData);
            widget.template = newContent;
            widgets = [...widgets];
            isEditing = false;
            widgetToEdit = null;
            hideContextMenu();
        } catch (err) {
            console.error('Failed to update widget:', err);
            error = 'Failed to update widget';
        }
    }

    async function handleDelete(id) {
        try {
            await deleteWidget(id);
            widgets = widgets.filter(widget => widget.id !== id);
            hideContextMenu();
        } catch (err) {
            console.error('Failed to delete widget:', err);
            error = 'Failed to delete widget';
        }
    }

    // Drag and drop functions
    function toggleDragMode() {
        isDragEnabled = !isDragEnabled;
        if (!isDragEnabled && hasUnsavedChanges) {
            widgets = [...pendingPositions];
        }
        hasUnsavedChanges = false;
    }

    async function handleConsider(e) {
        const { items: newWidgets } = e.detail;
        if (!pendingPositions.length) {
            pendingPositions = [...widgets];
        }
        widgets = newWidgets;
    }

    async function handleFinalize(e) {
        const { items: newWidgets } = e.detail;
        widgets = newWidgets;
        hasUnsavedChanges = true;
    }

    async function savePositions() {
        try {
            const updates = widgets.map((widget, index) => {
                const widgetData = {
                    id_widget: widget.id,
                    position: index,
                    type: widget.type,
                    contenu: widget.template,
                    id_utilisateur: FIXED_USER_ID
                };
                return updateWidget(widgetData);
            });
            
            await Promise.all(updates);
            hasUnsavedChanges = false;
            pendingPositions = [];
            isDragEnabled = false;
        } catch (err) {
            console.error('Failed to save positions:', err);
            error = 'Failed to save widget positions';
        }
    }

    // UI helper functions
    function showContextMenu({ widgetId, event }) {
        selectedWidgetId = widgetId;
        contextMenuPosition = { x: event.clientX, y: event.clientY };
        contextMenuVisible = true;
    }

    function hideContextMenu() {
        contextMenuVisible = false;
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

{#if $isConnected}
    <div class="container mx-auto p-4" on:click={hideContextMenu} role="presentation">
        {#if isLoading}
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        {:else if error}
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                <p class="font-bold">Error</p>
                <p>{error}</p>
            </div>
        {:else}
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-3xl font-bold">Widget list</h1>
                <div class="flex gap-2">
                    <button 
                        on:click={toggleDragMode}
                        class="px-4 py-2 rounded transition-colors {isDragEnabled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'} text-white">
                        {isDragEnabled ? 'Cancel Reorder' : 'Reorder Widgets'}
                    </button>
                    {#if hasUnsavedChanges}
                        <button 
                            on:click={savePositions}
                            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors">
                            Save Positions
                        </button>
                    {/if}
                    <button 
                        on:click={() => showPopup = true}
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                        Add Widget
                    </button>
                </div>
            </div>

            <div 
                class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 p-6 mx-auto max-w-[1800px]" 
                use:dndzone={{items: widgets, flipDurationMs, dragDisabled: !isDragEnabled || isEditing}}
                on:consider={handleConsider}
                on:finalize={handleFinalize}>
                {#each widgets as widget (widget.id)}
                    <div class="flex justify-center">
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
        {/if}
    </div>
{:else}
    <div class="container mx-auto p-4">
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
            <p class="font-bold">Please Login</p>
            <p>You need to be logged in to view and manage your widgets.</p>
        </div>
    </div>
{/if}