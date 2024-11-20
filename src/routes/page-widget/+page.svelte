<script>
    import { dndzone } from "svelte-dnd-action";
    import ContextMenu from "./ContextMenu.svelte";
    import WidgetTemplate from "./WidgetTemplate.svelte";

    let showPopup = false;
    let widgets = [];
    let contextMenuVisible = false;
    let contextMenuPosition = { x: 0, y: 0 };
    let selectedWidgetId = null;
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

    function editWidget(id, newContent) {
        widgets = widgets.map((widget) =>
            widget.id === id ? { ...widget, template: newContent } : widget,
        );
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

    document.addEventListener('click', handleClickOutside);

    $: {
        if (!isEditing) {
            document.removeEventListener('click', handleClickOutside);
        }
    }
</script>

<div
    class="container mx-auto p-4"
    on:click={hideContextMenu}
    role="presentation"
>
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold">Widget list</h1>
        <button
            on:click={togglePopup}
            class="bg-blue-500 text-white px-4 py-2 rounded">Add Widget</button
        >
    </div>
    <div
        class="flex flex-wrap gap-4"
        use:dndzone={{ items: widgets, flipDurationMs: 0 }}
        on:consider={handleDndEvent}
        on:finalize={handleDndEvent}
    >
        {#each widgets as widget (widget.id)}
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
        {/each}
    </div>

    {#if showPopup}
        <div
            class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
        >
            <div
                class="bg-white p-8 rounded shadow-lg flex flex-col items-center justify-center w-100 h-100 underline"
            >
                <h2 class="text-2xl mb-4">
                    Sélectionnez un template de widget
                </h2>
                <button
                    on:click={() => addWidget("note")}
                    class="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >Bloc Notes</button
                >
                <button
                    on:click={() => addWidget("timer")}
                    class="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >Timer</button
                >
                <button
                    on:click={() => addWidget("spotify")}
                    class="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >Lecteur Spotify</button
                >
                <button
                    on:click={togglePopup}
                    class="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                    >Fermer</button
                >
            </div>
        </div>
    {/if}

    {#if contextMenuVisible}
        <ContextMenu
            position={contextMenuPosition}
            onEdit={startEditing}
            onDelete={deleteWidget}
            widgetId={selectedWidgetId}
        />
    {/if}
</div>
