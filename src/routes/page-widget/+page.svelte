<script>
    import { dndzone } from "svelte-dnd-action";
    import ContextMenu from "./ContextMenu.svelte";
    import Note from "$lib/Note.svelte";
    import Spotify from "$lib/Spotify.svelte";
    import { getWidgetsByUserId, insertWidget, updateWidget, deleteWidget } from '$lib/widgetService';
    import { getUserData } from '$lib/store.js';
    import { isConnected } from '$lib/store.js';
    import { fade } from 'svelte/transition';
    import { onDestroy, onMount } from 'svelte';
    

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
    let isFabMenuOpen = false;

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

    function toggleFabMenu() {
        isFabMenuOpen = !isFabMenuOpen;
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
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
                use:dndzone={{items: widgets, flipDurationMs, dragDisabled: !isDragEnabled || isEditing}}
                on:consider={handleConsider}
                on:finalize={handleFinalize}
                >
                {#each widgets as widget (widget.id)}
                {#if widget.type === 'note'}
                    <div class="w-full bg-white rounded-lg shadow-md">
                        <Note
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
                {:else if widget.type === 'spotify'}
                    <div class="w-full bg-white rounded-lg shadow-md">
                        <Spotify
                        />
                    </div>
                {/if}
                {/each}
            </div>

            {#if widgets.length === 0}
                <div class="w-full text-center text-gray-500 mt-8">
                    No widgets created yet. Click the + button to get started.
                </div>
            {/if}

            <!-- FAB Menu -->
            <div class="fixed bottom-8 right-8 z-40">
                {#if isFabMenuOpen}
                    <div class="absolute bottom-20 right-0 flex flex-col-reverse gap-3 items-end" transition:fade={{ duration: 200 }}>
                        <!-- Note Widget -->
                        <button 
                            on:click={() => {
                                addWidget("note");
                                toggleFabMenu();
                            }}
                            class="bg-blue-500 hover:bg-blue-600 text-white w-48 h-12 rounded-full shadow-lg flex items-center justify-center gap-2 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Note</span>
                        </button>
                        
                        <!-- Spotify Widget -->
                        <button 
                            on:click={() => {
                                addWidget("spotify");
                                toggleFabMenu();
                            }}
                            class="bg-green-500 hover:bg-green-600 text-white w-48 h-12 rounded-full shadow-lg flex items-center justify-center gap-2 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <span>Spotify</span>
                        </button>
                        
                        <!-- Timer Widget -->
                        <button 
                            on:click={() => {
                                addWidget("timer");
                                toggleFabMenu();
                            }}
                            class="bg-purple-500 hover:bg-purple-600 text-white w-48 h-12 rounded-full shadow-lg flex items-center justify-center gap-2 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Timer</span>
                        </button>
                    </div>
                {/if}
                
                <!-- Main FAB Button -->
                <button 
                    on:click={toggleFabMenu}
                    class="bg-blue-500 hover:bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 {isFabMenuOpen ? 'rotate-45' : ''}"
                    title="Add Widget"
                    aria-label="Add Widget"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

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