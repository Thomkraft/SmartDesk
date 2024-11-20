<script>
    import { onMount } from 'svelte';
    import SendMail from './SendMail.svelte';
    import NewPassword from './NewPassword.svelte';

    let showSendMail = true;

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('token')) {
            showSendMail = false;
        }
    });
</script>

{#if showSendMail}
    <SendMail />
{:else}
    <NewPassword />
{/if}