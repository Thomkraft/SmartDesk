<script>
    import "../app.css";
    let connected = false;
</script>

<header>
    <nav class="bg-gray-900 p-4 shadow-md">
        <div class="container mx-auto flex items-center justify-between">
            <div class="text-teal-400 text-xl font-semibold">
                <a href="/">SmartDesk</a>
            </div>
            <ul class="flex space-x-6 text-white text-sm font-medium">
                <li>
                    <a
                        href="/"
                        class="hover:text-teal-400 transition duration-200"
                        >ACCUEIL</a
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
                        >COMPTE</a
                    >
                </li>
            </ul>
            <button
                class="text-sm px-4 py-2 rounded bg-teal-500 hover:bg-teal-600 text-white transition duration-200"
                on:click={() => (connected = !connected)}
            >
                {#if connected}
                    Se déconnecter
                {:else}
                    Se connecter
                {/if}
            </button>
        </div>
    </nav>
</header>

<slot />

<footer class="bg-gray-900 p-4 shadow-md mt-10">
    <div
        class="container mx-auto flex flex-col items-center justify-center text-center"
    >
        <p class="text-white text-sm font-medium">
            © 2024 SmartDesk. Tous droits réservés.
        </p>
        <ul class="flex space-x-6 mt-4 text-white text-sm font-medium">
            <li>
                <a
                    href="/about"
                    class="hover:text-teal-400 transition duration-200"
                    >À propos</a
                >
            </li>
            <li>
                <a
                    href="/privacy"
                    class="hover:text-teal-400 transition duration-200"
                    >Confidentialité</a
                >
            </li>
            <li>
                <a
                    href="/contact"
                    class="hover:text-teal-400 transition duration-200"
                    >Contact</a
                >
            </li>
        </ul>
    </div>
</footer>
