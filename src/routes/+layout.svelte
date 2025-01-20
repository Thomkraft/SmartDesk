<script>
    import "../app.css";
    import Header from "$lib/Header.svelte";
    import Footer from "$lib/Footer.svelte";
</script>

<div class="flex flex-col h-screen">

    <header>
        <Header />
    </header>

    <main class="flex-grow flex-row">
        <slot />
    </main>

    <footer class="relative bg-gray-900 p-5">
        <Footer />
    </footer>

</div>

