<script>
    import { getUserData, isConnected, saveUserData } from "$lib/store.js";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let user = getUserData() || { pseudo: "Invité", email: "", id: "" };

    const userUpdate = {
        type: "",
        pseudo: user.pseudo,
        email: user.email,
        password: "",
        new_password: "",
        confirm_password: "",
        id: user.id
    };

    let isEditingInfo = false;
    let isEditingPassword = false;
    let isSameInfo = false;
    let isSameEmail = false;
    let isNotSamePassword = false;
    let isNotActualPassword = false;

    async function updateUser() {
        if (userUpdate.pseudo !== user.pseudo || userUpdate.email !== user.email) {
            alert("Exécution de la modification de pseudo ou d'email");

            userUpdate.type = "update-info";

            const response = await fetch("/page-account/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userUpdate),
            });

            if (response.ok) {
                alert("Informations mises à jour avec succès");
                userUpdate.type = "";
                isEditingInfo = false;

                saveUserData(userUpdate.email, userUpdate.pseudo, userUpdate.id);
                user = getUserData();


            } else {
                const errorMessage = await response.json();

                if (errorMessage.message === "Email already exists") {
                    isSameEmail = true;
                } else {
                    alert(errorMessage.message);
                }
            }
        } else {
            isSameInfo = true;
        }
    }

    async function updatePassword() {
        if (userUpdate.new_password !== userUpdate.confirm_password) {
            isNotSamePassword = true;
            return;
        }
        isNotSamePassword = false;
        isNotActualPassword = false;

        userUpdate.type = "update-password";

        const response = await fetch("/page-account/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userUpdate),
        });

        if (response.ok) {
            alert("Mot de passe mis à jour avec succès");
            userUpdate.type = "";
            isEditingPassword = false;
            refreshForm();
        } else {
            const errorMessage = await response.json();

            if (errorMessage.message === "Mot de passe actuel incorrect.") {
                isNotActualPassword = true;
            } else {
                alert(errorMessage.message);
            }
        }
    }

    function refreshForm() {
        userUpdate.pseudo = user.pseudo;
        userUpdate.email = user.email;
        userUpdate.password = "";
        userUpdate.new_password = "";
        userUpdate.confirm_password = "";

        isSameInfo = false;
        isSameEmail = false;
        isNotSamePassword = false;
        isNotActualPassword = false;
    }

</script>

<div class="container mx-auto p-4">

    {#if $isConnected === true}

        <h1 class="text-3xl font-bold text-center my-8">Bienvenue, {user.pseudo}</h1>

        <section class="account-information max-w-md mx-auto p-4 border rounded-lg shadow-md">
            <!-- Affichage des informations utilisateur -->
            {#if !isEditingInfo && !isEditingPassword}
                <h2 class="text-xl font-semibold mb-4">Informations personnelles</h2>

                <p><strong>Pseudo :</strong> {user.pseudo}</p>
                <p><strong>Email :</strong> {user.email}</p>

                <div class="mt-4 flex space-x-4">
                    <button class="p-2 bg-blue-600 text-white font-bold rounded" on:click={() => isEditingInfo = true}>Modifier les informations</button>
                    <button class="p-2 bg-blue-600 text-white font-bold rounded" on:click={() => isEditingPassword = true}>Modifier le mot de passe</button>
                </div>

            {/if}

            <!-- Formulaire de modification des informations utilisateur -->
            {#if isEditingInfo}
                <form on:submit|preventDefault={updateUser}>

                    <h2 class="text-xl font-semibold mb-4">Modifier les informations personnelles</h2>

                    {#if isSameInfo}
                        <p class="text-red-600">Vous n'avez pas modifié vos informations</p>
                    {/if}

                    <label for="pseudo" class="block mb-2 font-medium">Pseudo :</label>
                    <input type="text" name="pseudo" id="pseudo" bind:value="{userUpdate.pseudo}" class="w-full p-2 border rounded mb-4" required />

                    {#if isSameEmail}
                        <p class="text-red-600">L'email existe déja</p>
                    {/if}

                    <label for="email" class="block mb-2 font-medium">Email :</label>
                    <input type="email" name="email" id="email" bind:value="{userUpdate.email}" class="w-full p-2 border rounded mb-4" required />

                    <div class="flex space-x-4">
                        <button type="submit" class="p-2 bg-blue-600 text-white font-bold rounded">Enregistrer</button>
                        <button type="button" class="p-2 bg-gray-600 text-white font-bold rounded" on:click={() => {isEditingInfo = false;isSameInfo = false; refreshForm()}}>Annuler</button>
                    </div>
                </form>
            {/if}

            <!-- Formulaire de modification du mot de passe -->
            {#if isEditingPassword}
                <form on:submit|preventDefault={updatePassword}>

                    <h2 class="text-xl font-semibold mb-4">Changer de mot de passe</h2>

                    {#if isNotActualPassword}
                        <p class="text-red-600">Le mot de passe actuel est incorrect</p>
                        <!-- rajouter un mdp oublié ici ? -->
                    {/if}

                    <label for="current_password" class="block mb-2 font-medium">Mot de passe actuel :</label>
                    <input type="password" name="current_password" id="current_password" bind:value="{userUpdate.password}" class="w-full p-2 border rounded mb-4" required />

                    {#if isNotSamePassword}
                        <p class="text-red-600">Les mots de passe ne correspondent pas</p>
                    {/if} 

                    <label for="new_password" class="block mb-2 font-medium">Nouveau mot de passe :</label>
                    <input type="password" name="new_password" id="new_password" bind:value="{userUpdate.new_password}" class="w-full p-2 border rounded mb-4" required />

                    <label for="confirm_password" class="block mb-2 font-medium">Confirmer le mot de passe :</label>
                    <input type="password" name="confirm_password" id="confirm_password" bind:value="{userUpdate.confirm_password}" class="w-full p-2 border rounded mb-4" required />

                    <div class="flex space-x-4">
                        <button type="submit" class="p-2 bg-blue-600 text-white font-bold rounded">Enregistrer</button>
                        <button type="button" class="p-2 bg-gray-600 text-white font-bold rounded" on:click={() => {isEditingPassword = false;refreshForm()}}>Annuler</button>
                    </div>
                </form>
            {/if}
        </section>

    {:else}
        <div class="flex flex-col items-center h-full">

            <h1 class="text-3xl font-bold text-center my-8">Bienvenue voyageur du futur</h1>

            <p>Vous n'êtes pas connecté !</p>
            <p>Pour vous connecter ou vous inscrire, cliquez ici :</p>

            <div class="flex flex-row">

                <button
                    class="text-sm my-1 mx-1 px-3 py-1 rounded bg-teal-500 hover:bg-teal-600 text-white transition duration-200"
                    on:click={goto("/page-connection/connection/")}>Login</button>

                <button
                    class="text-sm my-1 px-3 py-1 rounded bg-teal-500 hover:bg-teal-600 text-white transition duration-200"
                    on:click={goto("/page-connection/register/")}>Sign in</button>

            </div>

        </div>
    {/if}

</div>
