// Fonction pour obtenir les initiales à partir du nom
function getInitials(nom, prenom) {
    if (!nom || !prenom) return '';
    return (nom.charAt(0) + prenom.charAt(0)).toUpperCase();
}

// Fonction pour obtenir les initiales à partir du nom complet (pour les étudiants)
function getInitialsFromFullName(nomComplet) {
    if (!nomComplet) return '';
    return nomComplet
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase();
}

// Fonction pour mettre à jour l'interface utilisateur avec les informations de l'utilisateur
function updateUserInterface() {
    const utilisateurJSON = sessionStorage.getItem('utilisateur');
    if (!utilisateurJSON) {
        window.location.href = 'login.html';
        return;
    }

    const utilisateur = JSON.parse(utilisateurJSON);
    
    // Mettre à jour les initiales dans le bouton de profil
    const profileToggle = document.getElementById('profile-toggle');
    const initialsSpan = profileToggle.querySelector('span');
    
    // Gérer les initiales selon le type d'utilisateur
    if (utilisateur.role === 'ETUDIANT') {
        initialsSpan.textContent = getInitialsFromFullName(utilisateur.nomComplet);
    } else {
        initialsSpan.textContent = getInitials(utilisateur.nom, utilisateur.prenom);
    }

    // Mettre à jour les informations dans le menu déroulant
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        // Mettre à jour le nom
        const nameElement = profileMenu.querySelector('.user-name');
        if (nameElement) {
            if (utilisateur.role === 'ETUDIANT') {
                nameElement.textContent = utilisateur.nomComplet;
            } else {
                nameElement.textContent = `${utilisateur.prenom} ${utilisateur.nom}`;
            }
        }

        // Mettre à jour l'email
        const emailElement = profileMenu.querySelector('.user-email');
        if (emailElement) emailElement.textContent = utilisateur.email || utilisateur.login;

        // Mettre à jour le rôle/statut
        const roleElement = profileMenu.querySelector('.user-role');
        if (roleElement) {
            switch(utilisateur.role) {
                case 'ETUDIANT':
                    roleElement.textContent = 'Étudiant';
                    break;
                case 'PROF':
                    roleElement.textContent = `${utilisateur.grade} - ${utilisateur.specialite}`;
                    break;
                case 'RP':
                    roleElement.textContent = 'Responsable Pédagogique';
                    break;
            }
        }
    }
}

function deconnexion() {
    sessionStorage.removeItem('utilisateur');
    window.location.href = 'login.html';
}

const logoutButton = document.getElementById("logout");
logoutButton.addEventListener('click', deconnexion);

document.addEventListener('DOMContentLoaded', updateUserInterface);

export { updateUserInterface };