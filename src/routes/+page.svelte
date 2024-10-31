<script>
    let active = true;
</script>



{#if active}
    <h1>Coucou</h1>
{:else}
    <h1>Salut</h1>
{/if}

<form
    on:submit|preventDefault={() => {
        active = !active;
    }}
>
    <input type="text" name="todo" id="todo"/>
    <button>+</button>
</form>