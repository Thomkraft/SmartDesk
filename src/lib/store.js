import { writable } from "svelte/store";

//stock la variable isConnected pour que tous les fichies y est acces
export const isConnected = writable(false);
export const toDate = writable(new Date(Date.now()));
export const selDate = writable(new Date(Date.now()));

