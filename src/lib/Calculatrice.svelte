<script>
    export let widget;
    export let onEdit;
    export let onDelete;
    export let onContextMenu;

    const MAX_DIGITS = 14;
    const MAX_VALUE = 1e14;
    let display = "0";
    let previousValue = null;
    let operation = null;
    let newNumber = true;

    function parseNumberFR(str) {
        return typeof str === 'string' 
            ? parseFloat(str.replace(/\s/g, '').replace(',', '.'))
            : str;
    }

    function formatNumber(num) {
        if (typeof num !== 'number') return num;
        if (!Number.isFinite(num) || Math.abs(num) > MAX_VALUE) return "Err: Dépassement";
        if (Math.abs(num) < 1e-10 && num !== 0) return "0";

        const str = num.toFixed(10).replace(/\.?0+$/, '');
        const [whole, decimal] = str.split('.');
        const formattedWhole = whole.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
        
        return decimal ? `${formattedWhole},${decimal}` : formattedWhole;
    }

    function formatDisplayNumber(str) {
        const [whole, decimal] = str.replace(/\s/g, '').split(',');
        const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return decimal ? `${formattedWhole},${decimal}` : formattedWhole;
    }

    function handleNumber(num) {
        if (newNumber) {
            display = num.toString();
            newNumber = false;
            return;
        }

        const digits = display.replace(/[^\d]/g, '');
        if (digits.length >= MAX_DIGITS) return;

        display = formatDisplayNumber(display === "0" 
            ? num.toString() 
            : display.replace(/\s/g, '') + num
        );
    }

    function calculate() {
        if (previousValue === null || newNumber) return;
        
        const current = parseNumberFR(display);
        try {
            let result;
            switch (operation) {
                case "+": result = previousValue + current; break;
                case "-": result = previousValue - current; break;
                case "×": result = previousValue * current; break;
                case "÷":
                    if (current === 0) {
                        display = "Err: Division par 0";
                        break;
                    }
                    result = previousValue / current;
                    break;
                default: return;
            }
            display = formatNumber(result);
        } catch {
            display = "Erreur";
        } finally {
            previousValue = null;
            operation = null;
            newNumber = true;
        }
    }

    function handleOperation(op) {
        if (operation && !newNumber) calculate();
        previousValue = parseNumberFR(display);
        operation = op;
        newNumber = true;
    }

    function addDecimal() {
        if (!display.includes(",")) {
            display = formatDisplayNumber(display) + ",";
            newNumber = false;
        }
    }

    function toggleSign() {
        if (display === "0" || display.startsWith("Err")) return;
        display = formatNumber(parseNumberFR(display) * -1);
    }

    function calculatePercentage() {
        display = formatNumber(parseNumberFR(display) / 100);
    }

    function clear() {
        display = "0";
        previousValue = null;
        operation = null;
        newNumber = true;
    }
</script>

<div 
    class="h-[500px] w-[400px] bg-gray-800 shadow-[0_-1px_1px_0_rgba(0,255,255,1),1px_0_1px_0_rgba(0,255,255,1)] flex flex-col"
    on:contextmenu|preventDefault={(event) => onContextMenu(event)}
    role="application"
>
    <div class="bg-gray-700 p-4 flex-none">
        <div class="text-right text-white text-3xl font-medium truncate">
            {display}
        </div>
    </div>

    <div class="grid grid-cols-4 gap-2 p-4 flex-grow">
        <button on:click={clear} class="btn bg-gray-500">AC</button>
        <button on:click={toggleSign} class="btn bg-gray-500">+/-</button>
        <button on:click={calculatePercentage} class="btn bg-gray-500">%</button>
        <button on:click={() => handleOperation("÷")} class="btn bg-orange-500">÷</button>

        {#each [[7,8,9,'×'], [4,5,6,'-'], [1,2,3,'+']] as row}
            {#each row as btn}
                <button 
                    on:click={() => typeof btn === 'number' ? handleNumber(btn) : handleOperation(btn)}
                    class="btn {typeof btn === 'number' ? 'bg-gray-600' : 'bg-orange-500'}"
                >
                    {btn}
                </button>
            {/each}
        {/each}

        <button on:click={() => handleNumber(0)} class="btn bg-gray-600 col-span-2">0</button>
        <button on:click={addDecimal} class="btn bg-gray-600">,</button>
        <button on:click={calculate} class="btn bg-orange-500">=</button>
    </div>
</div>

<style>
    .btn {
        @apply text-white text-xl font-semibold rounded-lg transition-colors duration-200 h-full flex items-center justify-center;
    }
    
    .btn:hover {
        filter: brightness(110%);
    }
    
    .btn:active {
        filter: brightness(90%);
    }
</style>
