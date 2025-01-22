<script>
    import Footer from "$lib/Footer.svelte";
    import { goto } from "$app/navigation";
    import { isConnected, getUserData,saveUserData } from "$lib/store.js";

    let email_utilisateur = "";
    let mdp_utilisateur = "";
    let rep = -1;
    let repbody = "";

    // Fonction pour gérer la soumission du formulaire
    async function handleSubmit(event) {

        event.preventDefault();

        // Appelle l'API avec les données utilisateur
        const response = await fetch("/page-connection/connection/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email_utilisateur, mdp_utilisateur }),
        });

        repbody = await response.json();

        if (response.status === 201) {
            rep = 0;
            isConnected.set(true);
            const {email_utilisateur , pseudo,id} = repbody;

            saveUserData(email_utilisateur , pseudo,id);

            window.setTimeout(() => {
                goto("/");
            }, 1000);
        } else {
            rep = 1;
        }
    }
</script>

<div class="flex-grow flex items-center justify-center min-h-96 h-full bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 class="text-2xl font-bold text-center">Connexion</h2>
        {#if rep === 0}
            <p
                class="bg-green-500 py-2 px-4 rounded text-white mb-4 text-center"
            >
                {repbody.message}
            </p>
        {:else if rep === 1}
            <p class="bg-red-500 py-2 px-4 rounded text-white mb-4 text-center">
                {repbody.message}
            </p>
        {/if}   
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div>
                <label
                        for="email"
                        class="block text-sm font-medium text-gray-700"
                        >Adresse mail</label>
                <input
                    class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    type="email"
                    id="email"
                    bind:value={email_utilisateur}
                    required
                />
            </div>
            <div>
                <label
                        for="password"
                        class="block text-sm font-medium text-gray-700"
                        >Mot de passe</label>
                <input
                    class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    type="password"
                    id="password"
                    bind:value={mdp_utilisateur}
                    required
                />
            </div>
            <button type="submit" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Se connecter</button>
        </form>

        <button class="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" on:click={goto("/page-connection/recovery/")}
            >Mot de passe oublié</button
        >
    </div>


</div>
