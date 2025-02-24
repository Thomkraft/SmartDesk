<script>
    let password = "";
    let confirmPassword = "";
    let rep = -1;
    let repbody = { message: "" };

    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get("token");

    async function handleSubmit() {
        if (password !== confirmPassword) {
            repbody.message = "Les mots de passe ne correspondent pas";
            rep = 1;
            return;
        }

        const response = await fetch("/page-connection/recovery/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token, password }),
        });
        repbody = await response.json();
        if (response.status === 201) {
            rep = 0;
            window.setTimeout(() => {
                goto("/page-connection/connection/");
            }, 1000);
        } else {
            rep = 1;
        }
    }
</script>

<div class="flex-grow flex items-center justify-center min-h-96 h-full bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 class="text-2xl font-bold text-center">New password</h2>
        {#if rep === 0}
            <p class="bg-green-500 py-2 px-4 rounded text-white mb-4 text-center">{repbody.message}</p>
        {:else if rep === 1}
            <p class="bg-red-500 py-2 px-4 rounded text-white mb-4 text-center">{repbody.message}</p>
        {/if}
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div>
                <label
                    for="password"
                    class="block text-sm font-medium text-gray-700"
                    >New password</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    required/>
            </div>
            <div>
                <label
                    for="confirmPassword"
                    class="block text-sm font-medium text-gray-700"
                    >Confirm password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    bind:value={confirmPassword}
                    class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    required/>
            </div>
            <button
                type="submit"
                class="w-full px-4 py-2 font-bold text-white bg-teal-400 rounded hover:bg-teal-500 focus:outline-none focus:ring focus:ring-indigo-200"
                >Send</button>
        </form>
    </div>
</div>
