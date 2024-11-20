<script>
    import { onMount } from "svelte";
    import axios from "axios";
    import { goto } from "$app/navigation";
    import { isConnected } from "$lib/store.js";


    let email_utilisateur = "";
    let mdp_utilisateur = "";
    let message = "";

    // Fonction pour gérer la soumission du formulaire
    async function handleSubmit(event) {
        event.preventDefault();

        // Appelle l'API avec les données utilisateur
        const response = await fetch('/page-connection/connection/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_utilisateur, mdp_utilisateur })
        });

        const data = await response.json();

        if (response.ok) {
            message = 'Connecté avec succes.';
            alert(message);

            isConnected.set(true);
            
            goto('../../');
          
        } else {
            
            message = data.message;

            //
            //en faire un composant pour eviter la redondance
            //
            //Faire un DOM.js dans lib
            //
            if (data.message === 'Cet email est lié a aucun compte') {

                const mailInput = document.getElementsByClassName("email")[0];
                const messagemail = document.createElement('p');

                const messageexist = document.getElementsByClassName('error-mail')[0];
                if (messageexist) {
                    messageexist.remove();
                }

                messagemail.innerHTML = "email lié a aucun compte";
                messagemail.style.color = 'red';
                messagemail.classList.add("error-mail");

                mailInput.insertAdjacentElement('afterend', messagemail);
            }

            if (data.message === 'MDP Incorrect') {

                const passwordinput = document.getElementsByClassName("password")[0];
                const messagepassword = document.createElement('p');

                const messageexist = document.getElementsByClassName('error-password')[0];
                if (messageexist) {
                    messageexist.remove();
                }

                messagepassword.innerHTML = "mdp incorrect";
                messagepassword.style.color = 'red';
                messagepassword.classList.add("error-password");

                passwordinput.insertAdjacentElement('afterend', messagepassword);
                }
            alert(message);
            
        }
    }


    // Fonction pour rediriger vers la page doublie de mdp
    const goToForgotpass = () => {
        goto('/page-connection/recovery/');
    };
</script>

<style>

    h1 {
        text-align: center;
    }

    form {
        display: flex;
        flex-direction: column;
        width: 300px;
        margin: auto;
        gap: 1rem;
    }
    input {
        padding: 0.5rem;
        font-size: 1rem;
        border: solid 1px #ced4da;
    }
    button {
        padding: 0.5rem;
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
    }
    button:hover {
        background-color: #0056b3;
    }
    .message {
        text-align: center;
        margin-top: 1rem;
    }

    /* Style pour le bouton en haut à droite */
    

    .forgotpass-button {
        display: block;
        top: 1rem;
        right: 10rem;
        background-color: #f7074f;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
        border: solid 1px #f7074f;

        margin: auto;
        margin-top: 1em;
    }

    .forgotpass-button:hover {
        background-color: #c50623;
    }
        
</style>

<h1>Connexion</h1>


<form on:submit|preventDefault={handleSubmit} class="form-connection">
    <input class="email"
        type="email"
        bind:value={email_utilisateur}
        placeholder="Email"
        required
    />
    
    <input class="password"
        type="password"
        bind:value={mdp_utilisateur}
        placeholder="Mot de passe"
        required
    />
    <button type="submit" class="submit">Se connecter</button>

</form>

<button class="forgotpass-button" on:click={goToForgotpass}>MDP oublié</button>

<p class="message">{message}</p>
