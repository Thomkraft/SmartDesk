import { writable } from 'svelte/store';

export const calendarData = writable([]);
export const toDate = writable(new Date(Date.now()));
export const selDate = writable(new Date(Date.now()));
export const notification = writable({
    show: false,
    message: '',
    type: ''
});
export const timerState = writable({
    activeTab: 'clock',
    stopwatchTime: 0,
    stopwatchRunning: false,
    timerDuration: 0,
    timerRemaining: 0,
    timerRunning: false,
    hours: null,
    minutes: null,
    seconds: null
});

const isConnected = writable(false);

if (typeof window !== "undefined") {
    const storedIsConnected = localStorage.getItem("isConnected");
    isConnected.set(storedIsConnected === "true");

    isConnected.subscribe((value) => {
        localStorage.setItem("isConnected", value.toString());
    });
}

export { isConnected };

export function saveUserData(email, pseudo, id) {
    if (typeof window !== "undefined") {
        localStorage.setItem("email", email);
        localStorage.setItem("pseudo", pseudo);
        localStorage.setItem("id", id);
    }
}

export function getUserData() {
    if (typeof window !== "undefined") {
        return {
            email: localStorage.getItem("email"),
            pseudo: localStorage.getItem("pseudo"),
            id: localStorage.getItem("id")
        };
    }
    return null;
}

export function clearAllData() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("email");
        localStorage.removeItem("pseudo");
        localStorage.removeItem("id");
        localStorage.removeItem("isConnected");
    }
}

export function saveFavorites(favorites) {
    if (typeof window !== "undefined") {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}

export function getFavorites() {
    if (typeof window !== "undefined") {
        const favorites = localStorage.getItem("favorites");
        return favorites ? JSON.parse(favorites) : [];
    }
    return [];
}