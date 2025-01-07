import { writable } from "svelte/store";


//stock la variable isConnected pour que tous les fichies y est acces

//let isConnected = writable(false);
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
    hours: 0,
    minutes: 0,
    seconds: 0
});

const isConnected = writable(false);


if (typeof window !== "undefined") {

    // Vérifie si "isConnected" est déjà dans le Local Storage
    const storedIsConnected = localStorage.getItem("isConnected");

    // Initialise la variable à false si elle n'existe pas encore
    isConnected.set(storedIsConnected === "true");

    // Met à jour le Local Storage dès que la valeur change
    isConnected.subscribe((value) => {
        localStorage.setItem("isConnected", value.toString());
    });



}
export { isConnected };

//UTILISATEUR

export function saveUserData(email, pseudo,id) {
    if (typeof window !== "undefined") {
        localStorage.setItem("email", email);
        localStorage.setItem("pseudo", pseudo);
        localStorage.setItem("id", id);
    }
}


export function getUserData() {
    if (typeof window !== "undefined") {
        return {
            email : localStorage.getItem("email"),
            pseudo : localStorage.getItem("pseudo"),
            id : localStorage.getItem("id")
        }
    }
    return null;
}

export function clearAllData() {
    if (typeof window !== "undefined") {
        localStorage.clear();
    }
}