<script>
    import { notification } from './store.js';
    import { fade } from 'svelte/transition';

    function closeNotification() {
        notification.set({ show: false, message: '', type: ''});
        if (window.alarmSound) {
            window.alarmSound.pause();
            window.alarmSound.currentTime = 0;
        }
    }
</script>

{#if $notification.show}
    {#if $notification.type === 'timer'}
    <div
        class="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 border border-cyan-500"
        transition:fade
    >

        <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{$notification.message}</span>
            </div>
            <button
                class="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded-md text-sm"
                on:click={closeNotification}
            >
                Stop Alarm
            </button>
        </div>
    </div>
    {/if}

    {#if $notification.type === 'alert'}
        <div
                class="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 border border-cyan-500"
                transition:fade
        >

            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{$notification.message}</span>
                </div>
            </div>
        </div>

        {setTimeout(closeNotification, 2000)}
    {/if}

{/if}