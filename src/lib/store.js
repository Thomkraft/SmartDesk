import { writable } from "svelte/store";

//stock la variable isConnected pour que tous les fichies y est acces
export const isConnected = writable(false);

