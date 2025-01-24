<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    let nom_utilisateur = "";
    let email_utilisateur = "";
    let mdp_utilisateur = "";
    let rep = -1;
    let repbody = "";

    const sleep = (time) => new Promise(resolve => setTimeout(resolve, time))


    // Fonction pour gérer la soumission du formulaire
    async function handleRegister(event) {
        event.preventDefault();

        // Appelle l'API avec les données utilisateur
        const response = await fetch("/page-connection/register/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nom_utilisateur,
                email_utilisateur,
                mdp_utilisateur,
            }),
        });

        repbody = await response.json();

        if (response.status === 201) {
            rep = 0;
            window.setTimeout(() => {
                goto("/page-connection/connection/");
            }, 3000);
        } else {
            rep = 1;
        }
    }
</script>

<div class="flex-grow flex items-center justify-center min-h-96 h-full bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 class="text-2xl font-bold text-center">Sign in</h2>
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
        <form on:submit={handleRegister} class="space-y-4">
            <div>
                <label
                    for="username"
                    class="block text-sm font-medium text-gray-700"
                    >Username</label
                >
                <input
                    type="text"
                    id="username"
                    bind:value={nom_utilisateur}
                    class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    required
                />
            </div>
            <div>
                <label
                    for="mail"
                    class="block text-sm font-medium text-gray-700"
                    >Email</label
                >
                <input
                    type="email"
                    id="email"
                    bind:value={email_utilisateur}
                    class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    required
                />
            </div>
            <div>
                <label
                    for="password"
                    class="block text-sm font-medium text-gray-700"
                    >Password</label
                >
                <input
                    type="password"
                    id="password"
                    bind:value={mdp_utilisateur}
                    class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    required
                />
            </div>
            <button
                type="submit"
                class="w-full px-4 py-2 font-bold text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring focus:ring-indigo-200"
                >Sign in</button
            >
        </form>
    </div>
</div>
