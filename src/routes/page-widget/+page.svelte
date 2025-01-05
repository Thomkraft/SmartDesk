<script>
    import { dndzone } from "svelte-dnd-action";
    import ContextMenu from "./ContextMenu.svelte";
    import Note from "$lib/Note.svelte";
    import Spotify from "$lib/Spotify.svelte";
    import Timer from "$lib/Timer.svelte";
    import { getWidgetsByUserId, insertWidget, updateWidget, deleteWidget } from '$lib/widgetService';
    import { getUserData } from '$lib/store.js';
    import { isConnected } from '$lib/store.js';
    import { fade } from 'svelte/transition';
    import { onDestroy, onMount } from 'svelte';
    import Notification from '$lib/Notification.svelte';
    

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
    let dragStarted = false;
    let dragTimeout;

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

    onMount(() => {
        window.addEventListener('click', (event) => {
            const contextMenu = document.querySelector('.context-menu');
            if (contextMenuVisible && !contextMenu?.contains(event.target)) {
                hideContextMenu();
            }
        });
    });

    async function addWidget(type) {
        try {
            const position = widgets.length;
            const template = type === 'timer' ? JSON.stringify({
                activeTab: 'clock',
                time: new Date(),
                stopwatchTime: 0,
                timerDuration: 0
            }) : "";
            
            const newWidget = { 
                type, 
                template, 
                position,
                id_utilisateur: FIXED_USER_ID 
            };
            const widgetId = await insertWidget(newWidget);
            newWidget.id = widgetId;
            widgets = [...widgets, newWidget];
        } catch (err) {
            console.error('Failed to add widget:', err);
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
        if (!dragStarted) {
            dragStarted = true;
            if (!pendingPositions.length) {
                pendingPositions = [...widgets];
            }
        }
        widgets = newWidgets;
    }

    async function handleFinalize(e) {
        const { items: newWidgets } = e.detail;
        // Clear any pending drag timeout
        if (dragTimeout) {
        clearTimeout(dragTimeout); 
        }
        
        // Add a small delay to ensure proper positioning
        dragTimeout = setTimeout(() => {
        widgets = newWidgets;
        hasUnsavedChanges = true;
        dragStarted = false;
        }, 50);
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
        event.preventDefault();
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

    onDestroy(() => {
    if (dragTimeout) {
      clearTimeout(dragTimeout);
    }
  });

</script>

{#if $isConnected}
    <div class="container mx-auto p-4" on:click|self={hideContextMenu} role="presentation">
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

            <div 
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-1 gap-y-2 p-0.5" 
                use:dndzone={{items: widgets, flipDurationMs, dragDisabled: !isDragEnabled || isEditing}}
                on:consider={handleConsider}
                on:finalize={handleFinalize}
            >
                {#each widgets as widget (widget.id)}
                    <div class="flex justify-center items-center p-0.5">
                        {#if widget.type === 'timer'}
                            <Timer
                                {widget}
                                onEdit={editWidget}
                                onDelete={handleDelete}
                                onContextMenu={(event) => showContextMenu({ widgetId: widget.id, event })}
                                isEditing={isEditing && widgetToEdit?.id === widget.id}
                                bind:widgetToEdit
                                onSave={editWidget}
                                onCancel={handleCancel}
                            />

                        {:else if widget.type === 'note'}
                            <Note
                                {widget}
                                onEdit={editWidget}
                                onDelete={handleDelete}
                                onContextMenu={(event) => showContextMenu({ widgetId: widget.id, event })}
                                isEditing={isEditing && widgetToEdit?.id === widget.id}
                                bind:widgetToEdit
                                onSave={editWidget}
                                onCancel={handleCancel}
                            />

                        {:else if widget.type === 'spotify'}
                            <div class="w-full bg-white rounded-lg shadow-md">
                                <Spotify
                                    {widget}
                                    onEdit={editWidget}
                                    onDelete={handleDelete}
                                    onContextMenu={(event) => showContextMenu({ widgetId: widget.id, event })}
                                />
                            </div>
                        {/if}
                    </div>
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
                    </div>
                {/if}
                
                <!-- FAB Toggle Button -->
                <button
                    on:click={toggleFabMenu}
                    class="bg-blue-500 hover:bg-blue-600 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
                    aria-label="Toggle FAB Menu"
                >
                    <svg
                        class="w-8 h-8 text-white transition-transform duration-200"
                        class:rotate-45={isFabMenuOpen}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
        </div>

            {#if contextMenuVisible}
                <div class="context-menu">
                    <ContextMenu 
                        position={contextMenuPosition}
                        onEdit={startEditing}
                        onDelete={handleDelete}
                        widgetId={selectedWidgetId}
                        type={widgets.find(w => w.id === selectedWidgetId)?.type}
                    />
                </div>
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

<Notification />