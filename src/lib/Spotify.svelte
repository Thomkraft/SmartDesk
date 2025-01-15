<script>
    import { onMount, onDestroy } from "svelte";

    export let widget;
    export let onEdit = () => {};
    export let onDelete = () => {};
    export let onContextMenu = () => {};

    let isPlaying = false;
    let accessToken = null;
    let currentTrack = null;
    let trackPollingInterval;
    let spotifyWindow = null;
    let progress = 0;
    let duration = 0;
    let progressInterval;
    let noPlayback = false;

    const clientId = "f34a83c0460345769ab81d8491433902";
    // Forcer HTTP pour l'URL de redirection
    const redirectUri = window.location.origin.replace('https://', 'http://') + "/api/spotify-auth";

    async function authenticateSpotify() {
        const scope =
            "user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control";
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

        return new Promise((resolve) => {
            const popup = window.open(
                authUrl,
                "Spotify Login",
                "width=800,height=600",
            );

            window.spotifyCallback = async (code) => {
                const response = await fetch("/api/spotify-auth", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code }),
                });

                const data = await response.json();
                if (!data.error) {
                    accessToken = data.access_token;
                    localStorage.setItem("spotifyToken", data.refresh_token);
                }
                resolve();
            };
        });
    }

    async function refreshToken() {
        const refreshToken = localStorage.getItem("spotifyToken");
        if (!refreshToken) return false;

        const response = await fetch("/api/spotify-auth", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();
        if (!data.error) {
            accessToken = data.access_token;
            return true;
        }
        return false;
    }

    async function togglePlayPause() {
        if (noPlayback) {
            openSpotifyPopup();
            return;
        }
        if (!accessToken) {
            await authenticateSpotify();
        }

        isPlaying = !isPlaying;
        await fetch(
            `https://api.spotify.com/v1/me/player/${isPlaying ? "play" : "pause"}`,
            {
                method: "PUT",
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );
        startProgressTimer();
    }

    async function skipTrack(direction) {
        if (noPlayback) {
            openSpotifyPopup();
            return;
        }
        if (!accessToken) {
            await authenticateSpotify();
        }

        await fetch(`https://api.spotify.com/v1/me/player/${direction}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    }

    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    async function getCurrentTrack() {
        try {
            const response = await fetch(
                "https://api.spotify.com/v1/me/player/currently-playing",
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                },
            );
            

            if (response.status === 204) {
                noPlayback = true;
                return;
            }

            if (response.status === 200) {
                noPlayback = false;
                const data = await response.json();
                currentTrack = data.item;
                isPlaying = data.is_playing;
                progress = data.progress_ms;
                duration = data.item.duration_ms;

                startProgressTimer();
            }
        } catch (error) {
            console.error(
                "Erreur lors de la récupération de la piste en cours:",
                error,
            );
        }
    }

    function startProgressTimer() {
        if (progressInterval) {
            clearInterval(progressInterval);
        }

        if (isPlaying) {
            progressInterval = setInterval(() => {
                if (progress < duration) {
                    progress += 1000;
                } else {
                    getCurrentTrack();
                }
            }, 1000);
        }
    }

    function openSpotifyPopup() {
        if (spotifyWindow && !spotifyWindow.closed) {
            spotifyWindow.focus();
        } else {
            spotifyWindow = window.open(
                "https://open.spotify.com",
                "SpotifyPlayer",
                "width=900,height=700,toolbar=0,location=0,menubar=0",
            );
        }
    }

    const defaultAlbumCover =
        "https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2";

    function getAlbumCoverUrl(track) {
        if (
            !track.album ||
            !track.album.images ||
            track.album.images.length === 0
        ) {
            return defaultAlbumCover;
        }
        return track.album.images[0].url;
    }

    onMount(async () => {
        if (!(await refreshToken())) {
            await authenticateSpotify();
        }

        await getCurrentTrack();
        trackPollingInterval = setInterval(getCurrentTrack, 3000);
    });

    onDestroy(() => {
        if (trackPollingInterval) {
            clearInterval(trackPollingInterval);
        }
        if (progressInterval) {
            clearInterval(progressInterval);
        }

        if (spotifyWindow && !spotifyWindow.closed) {
            spotifyWindow.close();
        }
    });

    const icons = {
        previous: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
        </svg>`,
        next: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
        </svg>`,
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
        </svg>`,
        pause: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
        </svg>`,
    };
</script>

<div
    class="bg-gray-800 h-full w-full flex flex-col"
    role="button"
    tabindex="0"
    on:dblclick={openSpotifyPopup}
    on:contextmenu|preventDefault={(event) => onContextMenu(event)}
> 
    <div
        class="bg-gray-800 p-2.5 rounded-lg text-white select-none"
        role="button"
        tabindex="0"
        on:dblclick={openSpotifyPopup}
    >
        {#if noPlayback}
            <div class="text-center py-4 text-gray-400">
                Aucune lecture en cours. Ouvrez Spotify pour commencer à écouter, vous pouvez double-cliquer ici pour ouvrir Spotify.
            </div>
        {:else if currentTrack}
            <div class="flex items-center mb-2.5 gap-2.5">
                <img
                    src={getAlbumCoverUrl(currentTrack)}
                    alt="Album cover"
                    class="w-[60px] h-[60px] rounded object-cover bg-black/30 album-cover"
                />
                <div class="flex flex-col overflow-hidden">
                    <span
                        class="font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                        {currentTrack.name || "Titre inconnu"}
                    </span>
                    <span
                        class="text-sm opacity-80 whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                        {currentTrack.artists?.[0]?.name || "Artiste inconnu"}
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-2 my-2.5 px-1.5">
                <span class="text-xs text-[#b3b3b3] min-w-[35px]"
                    >{formatTime(progress)}</span
                >
                <div class="flex-1 h-1 bg-white/10 rounded-sm overflow-hidden">
                    <div
                        class="h-full bg-[#1DB954] transition-[width] duration-1000 linear"
                        style="width: {(progress / duration) * 100}%"
                    ></div>
                </div>
                <span class="text-xs text-[#b3b3b3] min-w-[35px]"
                    >{formatTime(duration)}</span
                >
            </div>
        {/if}

        <div class="flex gap-2.5 justify-center mt-4">
            <button
                class="bg-transparent border-none text-white w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                tabindex="0"
                on:click={() => skipTrack("previous")}
            >
                {@html icons.previous}
            </button>
            <button
                class="bg-transparent border-none text-white w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                tabindex="0"
                on:click={togglePlayPause}
            >
                {@html isPlaying ? icons.pause : icons.play}
            </button>
            <button
                class="bg-transparent border-none text-white w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                tabindex="0"
                on:click={() => skipTrack("next")}
            >
                {@html icons.next}
            </button>
        </div>
    </div>
</div>

<style>
    :global(svg) {
        width: 24px;
        height: 24px;
    }
    .album-cover {
        max-height: 200px;
        width: auto;
    }
</style>
