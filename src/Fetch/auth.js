// auth.js
import { getData, postData } from './fetch.js';

async function verifierCredentials(email, password) {
    try {
        console.log('Vérification des credentials...');
        const etudiants = await getData('etudiants');
        console.log('Étudiants récupérés:', etudiants);
        
        const etudiant = etudiants.find(e => 
            e.login === email && e.mdp === password
        );
        console.log('Étudiant trouvé:', etudiant);

        if (etudiant) {
            sessionStorage.setItem('utilisateur', JSON.stringify(etudiant));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erreur lors de la vérification des credentials:', error);
        throw error;
    }
}

async function connexion(event) {
    event.preventDefault(); // Empêche la soumission normale du formulaire
    event.stopPropagation(); // Arrête la propagation de l'événement
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const estValide = await verifierCredentials(email, password);
        if (estValide) {
            // Utiliser history.pushState pour changer l'URL sans rechargement
            // Charger le contenu de main.html via AJAX ou modifier le DOM directement
            window.location.href = 'Main.html';
        } else {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.classList.remove('hidden');
            // Reste sur la même page sans redirection
            return false;
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        alert('Une erreur est survenue lors de la connexion');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (form) {
        // Utiliser l'événement submit plutôt que click
        form.addEventListener('submit', (e) => {
            connexion(e);
        });
    }

    // Vérification si déjà connecté
    if (estConnecte()) {
        window.location.href = 'Main.html';
    }
});
export function estConnecte() {
    const utilisateur = sessionStorage.getItem('utilisateur');
    return utilisateur !== null && utilisateur !== 'undefined';
}

export function deconnexion() {
    sessionStorage.removeItem('utilisateur');
    history.pushState({}, '', 'login.html');
    window.location.href = 'login.html';
}

export { verifierCredentials, connexion };