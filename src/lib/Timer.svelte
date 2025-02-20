<script>
    import { onMount, onDestroy } from 'svelte';
    import { notification, timerState } from './store.js';
    export let onContextMenu = () => {};
    
    let clockInterval;
    let stopwatchInterval;
    let timerInterval;
    let time = new Date();
    let alarmSound;
    
    $: ({
        activeTab,
        stopwatchTime,
        stopwatchRunning,
        timerDuration,
        timerRemaining,
        timerRunning,
        hours,
        minutes,
        seconds
    } = $timerState);

    onMount(() => {
        clockInterval = setInterval(() => {
            time = new Date();
        }, 1000);
        
        try {
            alarmSound = new Audio('/sounds/alarm.mp3');
        } catch (err) {
            console.error('Failed to load alarm sound:', err);
        }

        if (stopwatchRunning) {
            startStopwatch();
        }
        if (timerRunning) {
            resumeTimer();
        }
    });

    function startTimer() {
        const newDuration = hours * 3600 + minutes * 60 + seconds;
        timerState.update(state => ({
            ...state,
            timerDuration: newDuration,
            timerRemaining: newDuration,
            timerRunning: true
        }));
        
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        if ($timerState.timerRemaining > 0) {
            timerState.update(state => ({
                ...state,
                timerRemaining: state.timerRemaining - 1
            }));
        } else {
            clearInterval(timerInterval);
            timerState.update(state => ({...state, timerRunning: false}));
            window.alarmSound = alarmSound;
            alarmSound.play();
            notification.set({
                show: true,
                message: 'Timer Completed!',
                type: 'timer',
            });
        }
    }

    function resumeTimer() {
        timerInterval = setInterval(updateTimer, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerState.update(state => ({...state, timerRunning: false}));
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerState.update(state => ({
            ...state,
            timerRunning: false,
            timerRemaining: state.timerDuration
        }));
    }

    function toggleStopwatch() {
        if (!stopwatchRunning) {
            stopwatchInterval = setInterval(() => {
                timerState.update(state => ({
                    ...state,
                    stopwatchTime: state.stopwatchTime + 1
                }));
            }, 1000);
        } else {
            clearInterval(stopwatchInterval);
        }
        timerState.update(state => ({
            ...state,
            stopwatchRunning: !state.stopwatchRunning
        }));
    }

    function resetStopwatch() {
        clearInterval(stopwatchInterval);
        timerState.update(state => ({
            ...state,
            stopwatchTime: 0,
            stopwatchRunning: false
        }));
    }

    function formatTime(totalSeconds) {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    onDestroy(() => {
        clearInterval(clockInterval);
        clearInterval(stopwatchInterval);
        clearInterval(timerInterval);
    });
</script>

<div 
    class="h-[500px] w-[400px] bg-gray-800  flex flex-col"
    on:contextmenu|preventDefault={(event) => onContextMenu(event)}
    role="region"
>
    <div class="flex border-b border-gray-700">
        <button 
            class="flex-1 py-2 px-4 text-white {activeTab === 'clock' ? 'bg-gray-700' : ''}"
            on:click={() => timerState.update(state => ({...state, activeTab: 'clock'}))}>
            Clock
        </button>
        <button 
            class="flex-1 py-2 px-4 text-white {activeTab === 'stopwatch' ? 'bg-gray-700' : ''}"
            on:click={() => timerState.update(state => ({...state, activeTab: 'stopwatch'}))}>
            Stopwatch
        </button>
        <button 
            class="flex-1 py-2 px-4 text-white {activeTab === 'timer' ? 'bg-gray-700' : ''}"
            on:click={() => timerState.update(state => ({...state, activeTab: 'timer'}))}>
            Timer
        </button>
    </div>
    
    <div class="flex-1 p-4">
        {#if activeTab === 'clock'}
            <div class="flex items-center justify-center h-full">
                <div class="text-5xl font-bold text-white clock-animation">
                    {time.toLocaleTimeString()}
                </div>
            </div>
        {:else if activeTab === 'stopwatch'}
            <div class="flex flex-col items-center justify-center h-full">
                <div class="text-5xl font-bold text-white mb-8">
                    {formatTime(stopwatchTime)}
                </div>
                <div class="space-x-4">
                    <button 
                        class="px-6 py-2 bg-teal-500 text-white rounded"
                        on:click={toggleStopwatch}>
                        {stopwatchRunning ? 'Stop' : 'Start'}
                    </button>
                    <button 
                        class="px-6 py-2 bg-red-500 text-white rounded"
                        on:click={resetStopwatch}>
                        Reset
                    </button>
                </div>
            </div>
        {:else if activeTab === 'timer'}
            <div class="flex flex-col items-center justify-center h-full">
                {#if !timerRunning}
                    <div class="flex space-x-4 mb-8">
                        <input 
                            type="number" 
                            value={hours}
                            on:input={(e) => timerState.update(state => ({...state, hours: parseInt(e.target.value) || 0}))}
                            min="0"
                            max="99"
                            class="w-20 p-2 bg-gray-700 text-white rounded"
                            placeholder="HH"
                        >
                        <input 
                            type="number"
                            value={minutes}
                            on:input={(e) => timerState.update(state => ({...state, minutes: parseInt(e.target.value) || 0}))}
                            min="0"
                            max="59" 
                            class="w-20 p-2 bg-gray-700 text-white rounded"
                            placeholder="MM"
                        >
                        <input 
                            type="number"
                            value={seconds}
                            on:input={(e) => timerState.update(state => ({...state, seconds: parseInt(e.target.value) || 0}))}
                            min="0"
                            max="59"
                            class="w-20 p-2 bg-gray-700 text-white rounded"
                            placeholder="SS"
                        >
                    </div>
                {:else}
                    <div class="text-5xl font-bold text-white mb-8">
                        {formatTime(timerRemaining)}
                    </div>
                {/if}
                <div class="space-x-4">
                    <button 
                        class="px-6 py-2 bg-teal-500 text-white rounded"
                        on:click={timerRunning ? stopTimer : startTimer}>
                        {timerRunning ? 'Stop' : 'Start'}
                    </button>
                    <button 
                        class="px-6 py-2 bg-red-500 text-white rounded"
                        on:click={resetTimer}>
                        Reset
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .clock-animation {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none;
        margin: 0;
    }
    input[type=number] {
        -moz-appearance: textfield;
    }
</style>