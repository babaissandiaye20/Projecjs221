import { getData, postData } from './fetch.js';

async function verifierCredentials(email, password) {
    try {
        console.log('Vérification des credentials...');
        
        // Récupérer tous les types d'utilisateurs
        const etudiants = await getData('etudiants');
        const professeurs = await getData('professeurs');
        const responsablesPedagogiques = await getData('responsables_pedagogiques');
        
        // Vérifier dans chaque groupe d'utilisateurs
        const etudiant = etudiants.find(e => 
            e.login === email && e.mdp === password
        );
        
        const professeur = professeurs.find(p => 
            p.login === email && p.mdp === password
        );
        
        const responsablePedagogique = responsablesPedagogiques.find(rp => 
            rp.login === email && rp.mdp === password
        );

        // Retourner le premier utilisateur trouvé
        const utilisateur = etudiant || professeur || responsablePedagogique;
        
        if (utilisateur) {
            // Stocker l'utilisateur et son rôle
            sessionStorage.setItem('utilisateur', JSON.stringify(utilisateur));
            sessionStorage.setItem('role', utilisateur.role);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Erreur lors de la vérification des credentials:', error);
        throw error;
    }
}

async function connexion(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const estValide = await verifierCredentials(email, password);
        if (estValide) {
            const utilisateur = JSON.parse(sessionStorage.getItem('utilisateur'));
            
            // Rediriger vers différentes pages selon le rôle
            switch(utilisateur.role) {
                case 'ETUDIANT':
                    window.location.href = 'Main.html';
                    break;
                case 'PROF':
                    window.location.href = 'Main.html';
                    break;
                case 'RP':
                    window.location.href = 'annees.html';
                    break;
                default:
                    window.location.href = 'Main.html';
            }
        } else {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.classList.remove('hidden');
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
        form.addEventListener('submit', (e) => {
            connexion(e);
        });
    }
    
    if (estConnecte()) {
        const utilisateur = JSON.parse(sessionStorage.getItem('utilisateur'));
        // Redirection basée sur le rôle
        switch(utilisateur.role) {
            case 'ETUDIANT':
                window.location.href = 'Main.html';
                break;
            case 'PROF':
                window.location.href = 'MainProf.html';
                break;
            case 'RP':
                window.location.href = 'annee.html';
                break;
            default:
                window.location.href = 'Main.html';
        }
    }
});

export function estConnecte() {
    const utilisateur = sessionStorage.getItem('utilisateur');
    return utilisateur !== null && utilisateur !== 'undefined';
}

export function deconnexion() {
    sessionStorage.removeItem('utilisateur');
    sessionStorage.removeItem('role');
    window.location.href = 'login.html';
}

export { verifierCredentials, connexion };