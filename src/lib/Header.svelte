<script>
    import { goto } from "$app/navigation";
    import { writable } from "svelte/store";
    import { isConnected } from "$lib/store.js";
    import { on } from "svelte/events";

    let connected = isConnected;
    let favorites = [];
    let editIndex = null;
    let editFavoriteName = "";
    let editFavoriteUrl = "";
    let newFavoriteName = "";
    let newFavoriteUrl = "";
    let showContextMenu = false;
    let contextMenuPosition = {x: 0, y: 0};
    let contextIndex = null;
    let showModal = false;
    let showEditModal = false;
    let nameError = "";
    let urlError = "";

    function openContextMenu(event, index = null) {
        event.preventDefault();
        contextMenuPosition = {x: event.clientX, y: event.clientY};
        contextIndex = index;
        showContextMenu = true;
        document.addEventListener("click", handleClickOutside);
    }

    function handleClickOutside(event) {
        if (!event.target.closest(".context-menu")) {
            showContextMenu = false;
            document.removeEventListener("click", handleClickOutside);
        }
    }

    function editFavoriteItem(index) {
        editIndex = index;
        editFavoriteName = favorites[index].name;
        editFavoriteUrl = favorites[index].url;
        showEditModal = true;
        showContextMenu = false;
    }

    function deleteFavorite(index) {
        favorites = favorites.filter((_, i) => i !== index);
        showContextMenu = false;
    }

    function saveEdit() {
        if (editIndex !== null && editFavoriteName.trim() !== "") {
            if (
                !editFavoriteUrl.startsWith("http://") &&
                !editFavoriteUrl.startsWith("https://")
            ) {
                editFavoriteUrl = "http://" + editFavoriteUrl;
            }
            favorites[editIndex] = {
                name: editFavoriteName,
                url: editFavoriteUrl,
            };
            editIndex = null;
            editFavoriteName = "";
            editFavoriteUrl = "";
            showEditModal = false;
        }
    }

    function addFavorite() {
        nameError = "";
        urlError = "";

        if (newFavoriteName.trim() === "") {
            nameError = "Name is required";
        }

        if (newFavoriteUrl.trim() === "") {
            urlError = "URL is required";
        } else if (
            !newFavoriteUrl.startsWith("http://") &&
            !newFavoriteUrl.startsWith("https://")
        ) {
            newFavoriteUrl = "http://" + newFavoriteUrl;
        }

        if (nameError === "" && urlError === "") {
            favorites = [
                ...favorites,
                {name: newFavoriteName, url: newFavoriteUrl},
            ];
            newFavoriteName = "";
            newFavoriteUrl = "";
            showModal = false;
        }
    }

    function openAddFavoriteModal() {
        newFavoriteName = "";
        newFavoriteUrl = "";
        nameError = "";
        urlError = "";
        showModal = true;
    }

    function closeAddFavoriteModal() {
        showModal = false;
    }

    function closeEditFavoriteModal() {
        showEditModal = false;
    }

    function addNewFavoriteFromContextMenu() {
        openAddFavoriteModal();
        showContextMenu = false;
    }

    const goToConnection = () => {
        goto ('/page-connection/connection/');
    };

    const goToRegister = () => {
        goto ('/page-connection/register/');
    };

    function disconectionVerif () {
        if (confirm("Etes vous sur de vouloir vous déconnecter ?")) {
            isConnected.set(false);
            goto ('/');
        }
    }
</script>

<!-- Menu -->
<nav class="bg-gray-800 px-5 py-4 shadow-md">
    <div class="items-center flex">
        <div class="text-teal-400 text-xl font-semibold w-1/3 text-left">
            <a href="/">SmartDesk</a>
        </div>
        <ul class="flex text-white text-sm font-medium w-1/3 text-center justify-center gap-7">
            <li>
                <a
                        href="/"
                        class="hover:text-teal-400 transition duration-200"
                >HOME</a
                >
            </li>
            <li>
                <a
                        href="/page-widget"
                        class="hover:text-teal-400 transition duration-200"
                >WIDGETS</a
                >
            </li>
            <li>
                <a
                        href="/page-account"
                        class="hover:text-teal-400 transition duration-200"
                >ACCOUNT</a
                >
            </li>
        </ul>

        <div class="w-1/3 text-right">

            {#if $isConnected}
                <button
                    class="text-sm px-4 py-2 rounded bg-teal-500 hover:bg-teal-600 text-white transition duration-200"
                    on:click={disconectionVerif}
                    >

                    Se déconnecter
                </button>
            {:else}
                <button
                    class="text-sm px-4 py-2 rounded bg-teal-500 hover:bg-teal-600 text-white transition duration-200"
                    on:click={goToConnection}
                    >

                    Se connecter
                </button>
            {/if}
            
            {#if !$isConnected}
                <button
                        class="text-sm px-4 py-2 rounded bg-teal-500 hover:bg-teal-600 text-white transition duration-200"
                        on:click={goToRegister}
                >
                    S'inscrire
                </button>
            {/if}

        </div>

    </div>
</nav>

<!-- Favorites -->
<div class="bg-gray-700 px-5 shadow-md">
    <div class="container mx-auto flex items-center space-x-4">
        {#each favorites as favorite, index}
            <a
                    href={favorite.url}
                    class="text-gray-200 hover:text-teal-200 transition duration-200 px-2 py-1 rounded hover:bg-gray-600"
                    on:contextmenu={(e) => openContextMenu(e, index)}
            >
                {favorite.name}
            </a>
        {/each}
        <button
                on:click={openAddFavoriteModal}
                class="text-gray-200 hover:text-teal-200 transition duration-200 px-2 py-1 rounded hover:bg-gray-600"
        >
            +
        </button>
    </div>
</div>

<!-- Context Menu -->
{#if showContextMenu}
    <div
            class="absolute bg-gray-800 text-white p-2 rounded shadow-md context-menu"
            style="top: {contextMenuPosition.y}px; left: {contextMenuPosition.x}px;"
    >
        {#if contextIndex !== null}
            <button
                    on:click={() => editFavoriteItem(contextIndex)}
                    class="block px-4 py-2 hover:bg-gray-600">Edit
            </button
            >
            <button
                    on:click={() => deleteFavorite(contextIndex)}
                    class="block px-4 py-2 hover:bg-gray-600 text-red-400"
            >Delete
            </button
            >
        {:else}
            <button
                    on:click={addNewFavoriteFromContextMenu}
                    class="block px-4 py-2 hover:bg-gray-600"
            >New Favorite
            </button
            >
        {/if}
    </div>
{/if}

<!-- Modals New Favorite -->
{#if showModal}
    <div
            class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center"
    >
        <div class="bg-white p-4 rounded shadow-md w-96">
            <h2 class="text-lg font-semibold mb-4">Add New Favorite</h2>
            <div class="mb-4">
                <label
                        for="favorite-name"
                        class="block text-sm font-medium text-gray-700"
                >Name</label
                >
                <input
                        id="favorite-name"
                        type="text"
                        bind:value={newFavoriteName}
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {#if nameError}
                    <p class="text-red-500 text-sm mt-1">{nameError}</p>
                {/if}
            </div>
            <div class="mb-4">
                <label
                        for="favorite-url"
                        class="block text-sm font-medium text-gray-700"
                >URL</label
                >
                <input
                        id="favorite-url"
                        type="text"
                        bind:value={newFavoriteUrl}
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {#if urlError}
                    <p class="text-red-500 text-sm mt-1">{urlError}</p>
                {/if}
            </div>
            <div class="flex justify-end space-x-2">
                <button
                        on:click={closeAddFavoriteModal}
                        class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >Cancel
                </button
                >
                <button
                        on:click={addFavorite}
                        class="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded"
                >Save
                </button
                >
            </div>
        </div>
    </div>
{/if}

<!-- Modals Edit Favorite -->
{#if showEditModal}
    <div
            class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center"
    >
        <div class="bg-white p-4 rounded shadow-md w-96">
            <h2 class="text-lg font-semibold mb-4">Edit Favorite</h2>
            <div class="mb-4">
                <label
                        for="edit-favorite-name"
                        class="block text-sm font-medium text-gray-700"
                >Name</label
                >
                <input
                        id="edit-favorite-name"
                        type="text"
                        bind:value={editFavoriteName}
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
            </div>
            <div class="mb-4">
                <label
                        for="edit-favorite-url"
                        class="block text-sm font-medium text-gray-700"
                >URL</label
                >
                <input
                        id="edit-favorite-url"
                        type="text"
                        bind:value={editFavoriteUrl}
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
            </div>
            <div class="flex justify-end space-x-2">
                <button
                        on:click={closeEditFavoriteModal}
                        class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >Cancel
                </button
                >
                <button
                        on:click={saveEdit}
                        class="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded"
                >Save
                </button
                >
            </div>
        </div>
    </div>
{/if}
