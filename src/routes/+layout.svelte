<script>
    import "../app.css";
    import Header from "$lib/Header.svelte";
</script>

<div class="flex flex-col h-screen">

    <header>
        <Header />
    </header>

    <main class="flex flex-grow flex-row">
        <slot />
    </main>

</div>

