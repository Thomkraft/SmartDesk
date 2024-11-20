<script>
    import "../app.css";
    import Header from "$lib/Header.svelte";
    import Footer from "$lib/Footer.svelte";
</script>

<header class="h-1/5">
    <Header />
</header>

<main>
    <slot />
</main>

<footer class="bg-gray-900 p-5">
    <Footer />
</footer>

