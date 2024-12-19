// Fonction pour obtenir les initiales à partir du nom complet
  
function getInitials(nomComplet) {
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
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        window.location.href = 'login.html';
        return;
    }

    const utilisateur = JSON.parse(utilisateurJSON);
    
    // Mettre à jour les initiales dans le bouton de profil
    const profileToggle = document.getElementById('profile-toggle');
    const initialsSpan = profileToggle.querySelector('span');
    initialsSpan.textContent = getInitials(utilisateur.nomComplet);

    // Mettre à jour les informations dans le menu déroulant
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        // Mettre à jour le nom
        const nameElement = profileMenu.querySelector('a:nth-child(1) span');
        if (nameElement) nameElement.textContent = utilisateur.nomComplet;

        // Mettre à jour l'email
        const emailElement = profileMenu.querySelector('a:nth-child(2) span');
        if (emailElement) emailElement.textContent = utilisateur.login;

        // Ajouter un gestionnaire pour la déconnexion
        
    }
   
        }
        function deconnexion() {
            sessionStorage.removeItem('utilisateur');
            
            window.location.href = 'login.html';
        }
        

        const logoutButton =  document.getElementById("logout");
        logoutButton.addEventListener('click', () => {
        
            deconnexion();
        });
// Exécuter la mise à jour au chargement de la page
document.addEventListener('DOMContentLoaded', updateUserInterface);
export {updateUserInterface};