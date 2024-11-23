<script>
    let email = "";
    let rep = -1;
    let repbody = "";

    const handleSubmit = async () => {
        const response = await fetch("/page-connection/recovery/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        repbody = await response.json();
        if (response.status === 201) {
            rep = 0;
        } else {
            rep = 1;
        }
    };
</script>

<div class="flex items-center justify-center min-h-96 h-full bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6">Récuperation de compte</h1>
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

        <form on:submit|preventDefault={handleSubmit}>
            <div class="mb-4">
                <label for="email" class="block text-gray-700">
                    Adresse mail
                </label>
                <input
                    type="email"
                    id="email"
                    bind:value={email}
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <button
                type="submit"
                class="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >Continuer
            </button>
        </form>
    </div>
</div>
