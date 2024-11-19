<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    let nom_utilisateur = '';
    let email_utilisateur = '';
    let mdp_utilisateur = '';
    let message = '';

    // Fonction pour gérer la soumission du formulaire
    async function handleRegister(event) {
        event.preventDefault();

        // Appelle l'API avec les données utilisateur
        const response = await fetch('/page-connection/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom_utilisateur, email_utilisateur, mdp_utilisateur })
        });

        const data = await response.json();

        if (response.ok) {
            message = 'Utilisateur créé avec succès.';
            alert(message);
            goto('/page-connection/connection/');
            
        } else {
            alert(data.message);
            message = data.message;
        }
    }


</script>

<style>
    h1 {
        text-align: center;
    }

    form {
        max-width: 400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
    }
    input {
        margin: 10px 0;
        padding: 10px;
        font-size: 16px;
        border: solid 1px #ced4da;
    }
    button {
        padding: 10px;
        font-size: 16px;
        background-color: #007BFF;
        color: white;
        border: none;
        cursor: pointer;
    }
    button:hover {
        background-color: #0056b3;
    }
    .message {
        margin-top: 10px;
        font-weight: bold;
    }
</style>

<h1>Inscription</h1>
<form on:submit={handleRegister}>
    <input
        type="text"
        bind:value={nom_utilisateur}
        placeholder="Nom d'utilisateur"
        required
    />
    <input
        type="email"
        bind:value={email_utilisateur}
        placeholder="Email"
        required
    />
    <input
        type="password"
        bind:value={mdp_utilisateur}
        placeholder="Mot de passe"
        required
    />
    <button type="submit">S'inscrire</button>
</form>

<p class="message">{message}</p>
